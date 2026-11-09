<?php
/**
 * Plugin Name: SoleMart Comparison Draft Import
 * Description: Import the five bundled SoleMart comparisons as editable Post drafts using your existing WordPress login.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) { exit; }

function solemart_comparison_import_allowed() {
    return current_user_can('manage_options') && current_user_can('edit_posts')
        && current_user_can('edit_others_posts') && current_user_can('read_private_posts');
}

function solemart_comparison_import_articles() {
    $path = __DIR__ . '/articles.json';
    $articles = is_readable($path) ? json_decode(file_get_contents($path), true) : null;
    $expected = array('cowhide-boots-vs-leather-boots', 'cowboy-boots-vs-work-boots', 'steel-toe-vs-composite-toe-boots', 'work-boots-vs-hiking-boots', 'wrestling-shoes-vs-boxing-shoes');
    if (!is_array($articles) || count($articles) !== count($expected)) {
        return new WP_Error('solemart_package', 'The bundled article file is incomplete. Install the complete ZIP package.');
    }
    $seen = array();
    foreach ($articles as $article) {
        if (!is_array($article) || !isset($article['slug'], $article['title'], $article['excerpt'], $article['content'], $article['status'])
            || !is_string($article['slug']) || !is_string($article['title']) || !is_string($article['excerpt']) || !is_string($article['content'])
            || $article['status'] !== 'draft' || !in_array($article['slug'], $expected, true) || isset($seen[$article['slug']])
            || trim($article['title']) === '' || trim($article['content']) === '' || strlen($article['content']) > 200000) {
            return new WP_Error('solemart_package', 'The bundled article data is invalid. No drafts were created.');
        }
        $seen[$article['slug']] = true;
    }
    return $articles;
}

function solemart_comparison_import_normalize($text) {
    $text = strtolower(remove_accents(html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES, 'UTF-8')));
    return trim(preg_replace('/[^a-z0-9]+/', ' ', $text));
}

function solemart_comparison_import_inventory() {
    return get_posts(array(
        'post_type' => 'post', 'post_status' => array('publish', 'future', 'draft', 'pending', 'private'),
        'numberposts' => -1, 'orderby' => 'ID', 'order' => 'ASC', 'suppress_filters' => true,
    ));
}

function solemart_comparison_import_matches($article, $posts) {
    $matches = array();
    $topic = solemart_comparison_import_normalize($article['slug']);
    foreach ($posts as $post) {
        $title = solemart_comparison_import_normalize($post->post_title);
        $focus = get_post_meta($post->ID, 'rank_math_focus_keyword', true);
        $keywords = is_string($focus) ? array_map('solemart_comparison_import_normalize', explode(',', $focus)) : array();
        if ($post->post_name === $article['slug'] || strpos($post->post_name, $article['slug'] . '-') === 0
            || $title === $topic || strpos($title, $topic . ' ') === 0
            || in_array($topic, $keywords, true)
            || get_post_meta($post->ID, '_solemart_comparison_source_slug', true) === $article['slug']) {
            $matches[] = $post;
        }
    }
    return $matches;
}

function solemart_comparison_import_apply($articles) {
    if (!solemart_comparison_import_allowed()) {
        return new WP_Error('solemart_permission', 'An administrator with Post editing access must run the import.');
    }
    $lock = 'solemart_comparison_import_lock';
    $started = (int) get_option($lock, 0);
    if ($started && time() - $started > 300) { delete_option($lock); }
    if (!add_option($lock, time(), '', false)) {
        return new WP_Error('solemart_busy', 'An import is already running. Refresh this page before trying again.');
    }
    try {
        $inventory = solemart_comparison_import_inventory();
        foreach ($articles as $article) {
            if (count(solemart_comparison_import_matches($article, $inventory)) > 1) {
                return new WP_Error('solemart_duplicates', 'More than one existing Post matches a comparison. Review the matching Posts first; no new drafts were created.');
            }
        }
        $results = array();
        foreach ($articles as $article) {
            $matches = solemart_comparison_import_matches($article, solemart_comparison_import_inventory());
            if (count($matches) > 1) {
                return new WP_Error('solemart_changed', 'Matching Posts changed during import. Completed drafts are listed below; existing Posts were not overwritten.');
            }
            if (count($matches) === 1) {
                $post = $matches[0];
                $results[] = array('id' => $post->ID, 'slug' => $post->post_name, 'status' => $post->post_status, 'action' => 'Existing Post preserved');
            } else {
                $id = wp_insert_post(wp_slash(array(
                    'post_type' => 'post', 'post_status' => 'draft', 'post_name' => $article['slug'],
                    'post_title' => sanitize_text_field($article['title']), 'post_excerpt' => wp_strip_all_tags($article['excerpt']),
                    'post_content' => wp_kses_post($article['content']), 'post_author' => get_current_user_id(),
                    'meta_input' => array('_solemart_comparison_source_slug' => $article['slug']),
                )), true);
                if (is_wp_error($id)) { return $id; }
                if (!is_int($id) || $id < 1) { return new WP_Error('solemart_result', 'WordPress did not return a valid draft ID. Inspect Posts before trying again.'); }
                $post = get_post($id);
                $confirmed = $post && $post->post_status === 'draft' && $post->post_name === $article['slug'];
                $results[] = array('id' => (int) $id, 'slug' => $post ? $post->post_name : $article['slug'], 'status' => $post ? $post->post_status : 'unknown', 'action' => $confirmed ? 'Draft created' : 'Inspect unexpected result');
                update_option('solemart_comparison_import_results', $results, false);
                if (!$confirmed) {
                    return new WP_Error('solemart_result', 'WordPress returned an unexpected status or slug. Inspect the recorded Post before continuing. No automatic retry was made.');
                }
            }
            update_option('solemart_comparison_import_results', $results, false);
        }
        return $results;
    } finally {
        delete_option($lock);
    }
}

function solemart_comparison_import_submit() {
    if (!solemart_comparison_import_allowed()) { wp_die('You cannot import these drafts.'); }
    check_admin_referer('solemart_import_comparisons');
    $articles = solemart_comparison_import_articles();
    $result = is_wp_error($articles) ? $articles : solemart_comparison_import_apply($articles);
    update_option('solemart_comparison_import_error', is_wp_error($result) ? $result->get_error_message() : '', false);
    wp_safe_redirect(admin_url('tools.php?page=solemart-comparison-import'));
    exit;
}
add_action('admin_post_solemart_import_comparisons', 'solemart_comparison_import_submit');

function solemart_comparison_import_page() {
    if (!solemart_comparison_import_allowed()) { wp_die('You cannot open this importer.'); }
    $articles = solemart_comparison_import_articles();
    echo '<div class="wrap"><h1>SoleMart Comparison Draft Import</h1>';
    echo '<p>This package imports five ordinary WordPress Post drafts. Existing matching Posts keep their text, images, status and URL. No application password or Codex connection is required.</p>';
    if (is_wp_error($articles)) { echo '<div class="notice notice-error"><p>' . esc_html($articles->get_error_message()) . '</p></div></div>'; return; }
    $error = get_option('solemart_comparison_import_error', '');
    if ($error) { echo '<div class="notice notice-error"><p>' . esc_html($error) . '</p></div>'; }
    $posts = solemart_comparison_import_inventory();
    echo '<table class="widefat striped"><thead><tr><th>Article</th><th>Import action</th></tr></thead><tbody>';
    foreach ($articles as $article) {
        $matches = solemart_comparison_import_matches($article, $posts);
        echo '<tr><td>' . esc_html($article['title']) . '</td><td>';
        if (!$matches) { echo 'Create a draft'; }
        else {
            echo count($matches) > 1 ? 'Multiple matches: review before importing. ' : 'Preserve existing Post. ';
            foreach ($matches as $post) {
                echo '<a href="' . esc_url(get_edit_post_link($post->ID)) . '">' . esc_html($post->post_title) . '</a> (' . esc_html($post->post_status) . ') ';
            }
        }
        echo '</td></tr>';
    }
    echo '</tbody></table><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="margin-top:20px">';
    echo '<input type="hidden" name="action" value="solemart_import_comparisons">';
    wp_nonce_field('solemart_import_comparisons');
    submit_button('Create missing drafts', 'primary', 'submit', false);
    echo '</form>';
    $results = get_option('solemart_comparison_import_results', array());
    if ($results) {
        echo '<h2>Imported or existing Posts</h2><ul>';
        foreach ($results as $result) {
            echo '<li><a href="' . esc_url(get_edit_post_link((int) $result['id'])) . '">Open ' . esc_html($result['slug']) . '</a> — ' . esc_html($result['action']) . ' (' . esc_html($result['status']) . ')</li>';
        }
        echo '</ul>';
    }
    echo '<h2>Add your photographs</h2><p>Open each draft, set its Featured Image, and use Replace on the Image block below Quick answer. The temporary placeholders are already included. Review and publish in WordPress when ready; the frontend reads published Posts at <code>https://thesolemart.com/blog/&lt;post-slug&gt;</code>.</p>';
    echo '<p>The importer only runs when you press the button. You can deactivate and delete it after importing; your Posts remain.</p></div>';
}

add_action('admin_menu', function () {
    add_management_page('SoleMart Comparison Draft Import', 'SoleMart Comparison Import', 'manage_options', 'solemart-comparison-import', 'solemart_comparison_import_page');
});
