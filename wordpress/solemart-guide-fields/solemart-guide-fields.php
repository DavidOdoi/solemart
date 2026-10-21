<?php
/**
 * Plugin Name: SOLEMART Guide Fields
 * Description: Editorial fields for the existing SOLEMART Next.js buying-guide template. Requires WPGraphQL and the buying_guides post type.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) { exit; }

function solemart_guide_schema() {
    static $schema;
    if (!isset($schema)) { $schema = json_decode(file_get_contents(__DIR__ . '/schema.json'), true); }
    return is_array($schema) ? $schema : array();
}

add_action('add_meta_boxes_buying_guides', function () {
    add_meta_box('solemart-guide-fields', 'SOLEMART — Your Next.js Template', 'solemart_guide_box', 'buying_guides', 'normal', 'high');
});

function solemart_guide_box($post) {
    wp_nonce_field('solemart_save_guide', 'solemart_guide_nonce');
    $value = get_post_meta($post->ID, '_solemart_guide_fields', true);
    echo '<p>These fields fill your existing Next.js design. Use the main editor for additional buying-guide text. Upload images to your WordPress Media Library. Leave unused sections empty.</p>';
    echo '<div id="solemart-guide-editor"></div>';
    echo '<input type="hidden" id="solemart-guide-payload" name="solemart_guide_payload" value="' . esc_attr(wp_json_encode(is_array($value) ? $value : array())) . '">';
}

add_action('admin_enqueue_scripts', function ($hook) {
    if (!in_array($hook, array('post.php', 'post-new.php'), true)) { return; }
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'buying_guides') { return; }
    wp_enqueue_media();
    wp_enqueue_script('solemart-guide-editor', plugins_url('editor.js', __FILE__), array(), '1.0.0', true);
    wp_localize_script('solemart-guide-editor', 'solemartGuideConfig', array('schema' => solemart_guide_schema()));
    wp_enqueue_style('solemart-guide-editor', plugins_url('editor.css', __FILE__), array(), '1.0.0');
});

function solemart_clean_guide_fields($input, $schema) {
    $clean = array();
    foreach ($schema as $key => $field) {
        if ($field['type'] === 'repeat') {
            $clean[$key] = array();
            $rows = isset($input[$key]) && is_array($input[$key]) ? array_slice($input[$key], 0, $field['max']) : array();
            foreach ($rows as $row) {
                if (is_array($row)) { $clean[$key][] = solemart_clean_guide_fields($row, $field['fields']); }
            }
            continue;
        }
        $value = isset($input[$key]) && is_string($input[$key]) ? substr($input[$key], 0, 30000) : '';
        if (in_array($field['type'], array('url', 'image'), true)) {
            $clean[$key] = esc_url_raw($value, array('https'));
        } elseif ($field['type'] === 'textarea') {
            $clean[$key] = sanitize_textarea_field($value);
        } else {
            $clean[$key] = sanitize_text_field($value);
        }
    }
    return $clean;
}

add_action('save_post_buying_guides', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
    if (wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) { return; }
    if (!isset($_POST['solemart_guide_nonce']) || !is_string($_POST['solemart_guide_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['solemart_guide_nonce'])), 'solemart_save_guide')) { return; }
    if (!isset($_POST['solemart_guide_payload']) || !is_string($_POST['solemart_guide_payload'])) { return; }
    $raw = wp_unslash($_POST['solemart_guide_payload']);
    if (strlen($raw) > 500000) { return; }
    $input = json_decode($raw, true);
    if (!is_array($input) || json_last_error() !== JSON_ERROR_NONE) { return; }
    update_post_meta($post_id, '_solemart_guide_fields', solemart_clean_guide_fields($input, solemart_guide_schema()));
});

add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_field')) { return; }
    register_graphql_field('BuyingGuide', 'solemartGuideData', array(
        'type' => 'String',
        'description' => 'Public editorial fields for the SOLEMART Next.js buying-guide template, encoded as JSON.',
        'resolve' => function ($source) {
            $id = isset($source->databaseId) ? (int) $source->databaseId : 0;
            if (!$id || get_post_type($id) !== 'buying_guides') { return null; }
            if (get_post_status($id) !== 'publish' && !current_user_can('read_post', $id)) { return null; }
            $fields = get_post_meta($id, '_solemart_guide_fields', true);
            return is_array($fields) ? wp_json_encode(solemart_clean_guide_fields($fields, solemart_guide_schema())) : null;
        },
    ));
});
