<?php
/** Isolated WordPress API fixtures; these tests do not contact the real CMS. */
define('ABSPATH', __DIR__);
class WP_Error {
    public $code;
    private $message;
    function __construct($code, $message) { $this->code = $code; $this->message = $message; }
    function get_error_message() { return $this->message; }
}
function is_wp_error($value) { return $value instanceof WP_Error; }
function add_action($name, $callback) { $GLOBALS['hooks'][$name] = $callback; }
function current_user_can($capability) { return $GLOBALS['allowed'] && ($capability !== 'read_private_posts' || $GLOBALS['private_allowed']); }
function get_current_user_id() { return 7; }
function get_option($key, $fallback = false) { return isset($GLOBALS['options'][$key]) ? $GLOBALS['options'][$key] : $fallback; }
function add_option($key, $value, $unused = '', $autoload = false) {
    if (array_key_exists($key, $GLOBALS['options'])) { return false; }
    $GLOBALS['options'][$key] = $value; return true;
}
function update_option($key, $value, $autoload = false) { $GLOBALS['options'][$key] = $value; return true; }
function delete_option($key) { unset($GLOBALS['options'][$key]); return true; }
function get_posts($query) {
    check($query['numberposts'] === -1, 'Inventory cannot stop at 100');
    check($query['post_type'] === 'post', 'Only native Posts are queried');
    return array_values(array_filter($GLOBALS['posts'], function ($post) use ($query) { return in_array($post->post_status, $query['post_status'], true); }));
}
function get_post($id) { return isset($GLOBALS['posts'][$id]) ? $GLOBALS['posts'][$id] : null; }
function get_post_meta($id, $key, $single) {
    $post = get_post($id);
    return $post && isset($post->meta_input[$key]) ? $post->meta_input[$key] : '';
}
function wp_insert_post($data, $errors) {
    check($errors === true && $data['post_status'] === 'draft', 'Every insert must explicitly request a draft');
    check($data['post_type'] === 'post' && $data['post_author'] === 7, 'Use native Posts and the authenticated user');
    check(!isset($data['post_date']), 'Do not invent a publication date');
    $GLOBALS['writes']++;
    if ($GLOBALS['writes'] === $GLOBALS['fail_at']) { return new WP_Error('fixture_failure', 'Fixture insert failure'); }
    $id = 900 + $GLOBALS['writes'];
    $GLOBALS['posts'][$id] = (object) array_merge($data, array('ID' => $id, 'post_status' => $GLOBALS['returned_status']));
    return $id;
}
function wp_strip_all_tags($value) { return strip_tags($value); }
function remove_accents($value) { return $value; }
function sanitize_text_field($value) { return strip_tags($value); }
function wp_kses_post($value) { return $value; }
function wp_slash($value) { return $value; }
function wp_die($message) { throw new RuntimeException($message); }
function check_admin_referer($action) {
    check($action === 'solemart_import_comparisons', 'The nonce action must match');
    if (!$GLOBALS['valid_nonce']) { throw new RuntimeException('Fixture nonce rejected'); }
}
function esc_html($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); }
function esc_url($value) { return esc_html($value); }
function get_edit_post_link($id) { return 'https://cms.thesolemart.com/wp-admin/post.php?post=' . $id . '&action=edit'; }
function admin_url($path) { return 'https://cms.thesolemart.com/wp-admin/' . $path; }
function wp_nonce_field($action) { echo '<input type="hidden" name="_wpnonce" value="fixture">'; }
function submit_button($label, $type, $name, $wrap) { echo '<button>' . esc_html($label) . '</button>'; }
function wp_safe_redirect($url) { throw new RuntimeException('Fixture redirect'); }
function check($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
function reset_fixture() {
    $GLOBALS['posts'] = array(); $GLOBALS['options'] = array(); $GLOBALS['writes'] = 0;
    $GLOBALS['allowed'] = true; $GLOBALS['valid_nonce'] = true; $GLOBALS['fail_at'] = -1;
    $GLOBALS['private_allowed'] = true; $GLOBALS['returned_status'] = 'draft';
}

reset_fixture();
require $argv[1];
check($GLOBALS['writes'] === 0, 'Loading/activating the plugin must not import anything');
check(isset($GLOBALS['hooks']['admin_post_solemart_import_comparisons']), 'Register only the authenticated admin action');
check(!isset($GLOBALS['hooks']['admin_post_nopriv_solemart_import_comparisons']), 'There must be no anonymous import handler');
$articles = solemart_comparison_import_articles();
check(is_array($articles) && count($articles) === 5, 'The ZIP must contain five valid articles');

$result = solemart_comparison_import_apply($articles);
check(count($result) === 5 && $GLOBALS['writes'] === 5, 'Create all five drafts');
check(count(get_option('solemart_comparison_import_results')) === 5, 'Record actual draft IDs');
$GLOBALS['posts'][901]->post_title = 'A manually revised title';
$GLOBALS['posts'][901]->post_name = 'a-manually-revised-url';
$GLOBALS['posts'][901]->post_content = 'Manual WordPress edits';
$again = solemart_comparison_import_apply($articles);
check($GLOBALS['writes'] === 5 && $again[0]['slug'] === 'a-manually-revised-url', 'A source marker prevents duplicate imports after editor changes');
check($GLOBALS['posts'][901]->post_content === 'Manual WordPress edits', 'Never overwrite manual edits');

reset_fixture();
for ($i = 1; $i <= 105; $i++) {
    $GLOBALS['posts'][$i] = (object) array('ID' => $i, 'post_name' => 'unrelated-' . $i, 'post_title' => 'Unrelated ' . $i, 'post_status' => 'publish');
}
$GLOBALS['posts'][106] = (object) array('ID' => 106, 'post_name' => 'original-cowhide-url', 'post_title' => 'Cowhide Boots vs Leather Boots: An existing article', 'post_status' => 'publish', 'post_content' => 'Original content');
$result = solemart_comparison_import_apply($articles);
check($GLOBALS['writes'] === 4 && $result[0]['id'] === 106, 'Detect an existing article beyond the first 100');
check($GLOBALS['posts'][106]->post_status === 'publish' && $GLOBALS['posts'][106]->post_content === 'Original content', 'Preserve publication state and content');

reset_fixture();
$GLOBALS['posts'][20] = (object) array('ID' => 20, 'post_name' => 'an-older-boot-guide', 'post_title' => 'An older material guide', 'post_status' => 'publish', 'meta_input' => array('rank_math_focus_keyword' => 'Cowhide boots vs leather boots, boot materials'));
$result = solemart_comparison_import_apply($articles);
check($GLOBALS['writes'] === 4 && $result[0]['id'] === 20, 'Rank Math focus keywords also identify an existing topic');

reset_fixture();
foreach (array(1, 2) as $id) {
    $GLOBALS['posts'][$id] = (object) array('ID' => $id, 'post_name' => $articles[0]['slug'] . '-' . $id, 'post_title' => 'Existing', 'post_status' => 'private');
}
check(is_wp_error(solemart_comparison_import_apply($articles)) && $GLOBALS['writes'] === 0, 'Ambiguous duplicates block creation');

reset_fixture(); $GLOBALS['allowed'] = false;
check(is_wp_error(solemart_comparison_import_apply($articles)) && $GLOBALS['writes'] === 0, 'Permission checks precede mutations');
reset_fixture(); $GLOBALS['private_allowed'] = false;
check(is_wp_error(solemart_comparison_import_apply($articles)) && $GLOBALS['writes'] === 0, 'A settings capability alone cannot expose private Posts');
reset_fixture(); $GLOBALS['valid_nonce'] = false;
try { solemart_comparison_import_submit(); throw new RuntimeException('The nonce was not checked'); }
catch (RuntimeException $error) { check($error->getMessage() === 'Fixture nonce rejected', 'Reject a missing/invalid admin nonce'); }
check($GLOBALS['writes'] === 0, 'Nonce rejection cannot create a draft');

reset_fixture(); add_option('solemart_comparison_import_lock', time());
check(is_wp_error(solemart_comparison_import_apply($articles)) && $GLOBALS['writes'] === 0, 'Concurrent imports are blocked');
reset_fixture(); $GLOBALS['fail_at'] = 3;
check(is_wp_error(solemart_comparison_import_apply($articles)), 'Propagate a partial insert failure');
check($GLOBALS['writes'] === 3 && count(get_option('solemart_comparison_import_results')) === 2, 'Retain completed IDs without retrying the failed write');
$result = solemart_comparison_import_apply($articles);
check(count($GLOBALS['posts']) === 5 && $result[0]['action'] === 'Existing Post preserved', 'A retry after inspection reuses completed drafts');

reset_fixture(); $GLOBALS['returned_status'] = 'publish';
check(is_wp_error(solemart_comparison_import_apply($articles)) && $GLOBALS['writes'] === 1, 'An unexpected hook-modified status stops further creation');
$recorded = get_option('solemart_comparison_import_results');
check($recorded[0]['status'] === 'publish' && $recorded[0]['action'] === 'Inspect unexpected result', 'Record the actual status without claiming successful draft creation');

ob_start(); solemart_comparison_import_page(); $html = ob_get_clean();
check(strpos($html, 'Create missing drafts') !== false && strpos($html, 'name="_wpnonce"') !== false, 'The admin page provides a nonce-protected import button');
check(strpos($html, 'post=901') !== false && strpos($html, 'Featured Image') !== false, 'Show actual editor links and image-editing instructions');
echo "PASS: five validated bundled articles; no activation writes; admin capability and nonce protection; draft-only inserts; existing URLs/content preserved beyond 100 posts; manual-edit markers; duplicate and concurrency guards; partial recovery journal; editor links and image instructions.\n";
