<?php
/**
 * Friendly LuxRide content editing screens.
 *
 * @package LuxRide
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('add_meta_boxes', 'luxride_register_friendly_meta_boxes');
add_action('save_post', 'luxride_save_friendly_meta_boxes', 10, 2);
add_action('admin_enqueue_scripts', 'luxride_enqueue_friendly_admin_assets');

function luxride_register_friendly_meta_boxes(): void
{
    add_meta_box('luxride_vehicle_details', __('Vehicle Details', 'luxride'), 'luxride_render_vehicle_box', 'luxride_vehicle', 'normal', 'high');
    add_meta_box('luxride_destination_details', __('Destination Details', 'luxride'), 'luxride_render_destination_box', 'luxride_destination', 'normal', 'high');
    add_meta_box('luxride_experience_details', __('Experience Details', 'luxride'), 'luxride_render_experience_box', 'luxride_experience', 'normal', 'high');
    add_meta_box('luxride_faq_details', __('FAQ Details', 'luxride'), 'luxride_render_faq_box', 'luxride_faq', 'normal', 'high');
}

function luxride_enqueue_friendly_admin_assets(string $hook): void
{
    if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
        return;
    }

    $screen = get_current_screen();
    if (!$screen || !in_array($screen->post_type, ['luxride_vehicle', 'luxride_destination', 'luxride_experience'], true)) {
        return;
    }

    wp_enqueue_media();
    wp_register_style('luxride-admin-fields', false, [], LUXRIDE_THEME_VERSION);
    wp_enqueue_style('luxride-admin-fields');
    wp_add_inline_style('luxride-admin-fields', '
        .luxride-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
        .luxride-admin-field{margin:0 0 14px}
        .luxride-admin-field label{display:block;font-weight:600;margin-bottom:5px}
        .luxride-admin-field input[type=text],.luxride-admin-field input[type=number],.luxride-admin-field select,.luxride-admin-field textarea{width:100%}
        .luxride-admin-note{color:#646970;font-size:12px;margin-top:4px}
        .luxride-media-preview{display:flex;align-items:center;gap:12px;margin-top:8px}
        .luxride-media-preview img{width:120px;height:72px;object-fit:cover;border:1px solid #dcdcde;background:#fff}
        .luxride-gallery-list{display:grid;gap:10px;margin-top:10px}
        .luxride-gallery-item{display:flex;align-items:center;gap:10px;border:1px solid #dcdcde;background:#fff;padding:8px}
        .luxride-gallery-item img{width:96px;height:54px;object-fit:cover}
        .luxride-checks label{display:block;margin:0 0 8px}
    ');
    wp_add_inline_script('jquery-core', luxride_admin_media_script());
}

function luxride_admin_media_script(): string
{
    return <<<'JS'
jQuery(function($){
  function previewHtml(url){ return url ? '<img src="'+_.escape(url)+'" alt="" />' : '<span class="description">No media selected.</span>'; }
  function bindSingle(context){
    $(context).find('[data-luxride-media-picker]').off('click.luxride').on('click.luxride', function(e){
      e.preventDefault();
      const field = $('#' + $(this).data('target'));
      const preview = $('#' + $(this).data('preview'));
      const frame = wp.media({ title: 'Select media', multiple: false, library: { type: $(this).data('type') || undefined } });
      frame.on('select', function(){
        const item = frame.state().get('selection').first().toJSON();
        field.val(item.url).trigger('change');
        preview.html(previewHtml(item.url));
      });
      frame.open();
    });
    $(context).find('[data-luxride-media-remove]').off('click.luxride').on('click.luxride', function(e){
      e.preventDefault();
      $('#' + $(this).data('target')).val('').trigger('change');
      $('#' + $(this).data('preview')).html(previewHtml(''));
    });
  }
  function readGallery(box){
    try { return JSON.parse(box.find('[data-luxride-gallery-value]').val() || '[]'); } catch(e) { return []; }
  }
  function writeGallery(box, items){
    box.find('[data-luxride-gallery-value]').val(JSON.stringify(items));
    const list = box.find('[data-luxride-gallery-list]').empty();
    items.forEach(function(url, index){
      list.append('<div class="luxride-gallery-item" data-index="'+index+'"><img src="'+_.escape(url)+'" alt="" /><code>'+_.escape(url)+'</code><span class="dashicons dashicons-move"></span><button type="button" class="button" data-gallery-up>Up</button><button type="button" class="button" data-gallery-down>Down</button><button type="button" class="button-link-delete" data-gallery-remove>Remove</button></div>');
    });
  }
  $('[data-luxride-gallery]').each(function(){
    const box = $(this);
    writeGallery(box, readGallery(box));
    box.on('click', '[data-luxride-gallery-add]', function(e){
      e.preventDefault();
      const frame = wp.media({ title: 'Select gallery images', multiple: true, library: { type: 'image' } });
      frame.on('select', function(){
        const items = readGallery(box);
        frame.state().get('selection').each(function(attachment){ items.push(attachment.toJSON().url); });
        writeGallery(box, items);
      });
      frame.open();
    });
    box.on('click', '[data-gallery-remove]', function(){ const items=readGallery(box); items.splice($(this).closest('[data-index]').data('index'),1); writeGallery(box,items); });
    box.on('click', '[data-gallery-up]', function(){ const items=readGallery(box); const i=$(this).closest('[data-index]').data('index'); if(i>0){ [items[i-1],items[i]]=[items[i],items[i-1]]; writeGallery(box,items); } });
    box.on('click', '[data-gallery-down]', function(){ const items=readGallery(box); const i=$(this).closest('[data-index]').data('index'); if(i<items.length-1){ [items[i+1],items[i]]=[items[i],items[i+1]]; writeGallery(box,items); } });
  });
  bindSingle(document);
});
JS;
}

function luxride_meta_value(int $post_id, string $key, mixed $default = ''): mixed
{
    $value = get_post_meta($post_id, $key, true);
    return '' === $value || null === $value ? $default : $value;
}

function luxride_field(string $label, string $name, mixed $value = '', string $type = 'text', array $attrs = []): void
{
    $id = 'luxride_' . sanitize_key($name);
    $attr = '';
    foreach ($attrs as $key => $attr_value) {
        $attr .= ' ' . esc_attr($key) . '="' . esc_attr((string) $attr_value) . '"';
    }
    echo '<p class="luxride-admin-field"><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label>';
    if ('textarea' === $type) {
        echo '<textarea id="' . esc_attr($id) . '" name="luxride_meta[' . esc_attr($name) . ']" rows="4"' . $attr . '>' . esc_textarea((string) $value) . '</textarea>';
    } else {
        echo '<input id="' . esc_attr($id) . '" type="' . esc_attr($type) . '" name="luxride_meta[' . esc_attr($name) . ']" value="' . esc_attr((string) $value) . '"' . $attr . ' />';
    }
    echo '</p>';
}

function luxride_select_field(string $label, string $name, mixed $value, array $options): void
{
    $id = 'luxride_' . sanitize_key($name);
    echo '<p class="luxride-admin-field"><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label><select id="' . esc_attr($id) . '" name="luxride_meta[' . esc_attr($name) . ']">';
    foreach ($options as $option_value => $option_label) {
        echo '<option value="' . esc_attr((string) $option_value) . '" ' . selected((string) $value, (string) $option_value, false) . '>' . esc_html((string) $option_label) . '</option>';
    }
    echo '</select></p>';
}

function luxride_checkbox(string $label, string $name, bool $checked): void
{
    echo '<label><input type="checkbox" name="luxride_meta[' . esc_attr($name) . ']" value="1" ' . checked($checked, true, false) . ' /> ' . esc_html($label) . '</label>';
}

function luxride_media_field(string $label, string $name, string $value, string $type = 'image'): void
{
    $id = 'luxride_' . sanitize_key($name);
    $preview = $id . '_preview';
    echo '<div class="luxride-admin-field"><label for="' . esc_attr($id) . '">' . esc_html($label) . '</label>';
    echo '<input id="' . esc_attr($id) . '" class="regular-text" type="text" name="luxride_meta[' . esc_attr($name) . ']" value="' . esc_attr($value) . '" />';
    echo '<div><button type="button" class="button" data-luxride-media-picker data-type="' . esc_attr($type) . '" data-target="' . esc_attr($id) . '" data-preview="' . esc_attr($preview) . '">' . esc_html__('Choose from Media Library', 'luxride') . '</button> ';
    echo '<button type="button" class="button-link-delete" data-luxride-media-remove data-target="' . esc_attr($id) . '" data-preview="' . esc_attr($preview) . '">' . esc_html__('Remove', 'luxride') . '</button></div>';
    echo '<div id="' . esc_attr($preview) . '" class="luxride-media-preview">';
    if ($value && 'image' === $type) {
        echo '<img src="' . esc_url($value) . '" alt="" />';
    } elseif ($value) {
        echo '<code>' . esc_html($value) . '</code>';
    } else {
        echo '<span class="description">' . esc_html__('No media selected.', 'luxride') . '</span>';
    }
    echo '</div></div>';
}

function luxride_gallery_field(string $value): void
{
    echo '<div class="luxride-admin-field" data-luxride-gallery>';
    echo '<label>' . esc_html__('Gallery Images', 'luxride') . '</label>';
    echo '<input type="hidden" data-luxride-gallery-value name="luxride_meta[luxride_gallery_urls]" value="' . esc_attr($value) . '" />';
    echo '<button type="button" class="button" data-luxride-gallery-add>' . esc_html__('Add Gallery Images', 'luxride') . '</button>';
    echo '<p class="luxride-admin-note">' . esc_html__('Use the buttons to reorder or remove photos. Keep Luxor gallery order unless intentionally changing it.', 'luxride') . '</p>';
    echo '<div class="luxride-gallery-list" data-luxride-gallery-list></div></div>';
}

function luxride_render_vehicle_box(WP_Post $post): void
{
    wp_nonce_field('luxride_friendly_meta', 'luxride_friendly_meta_nonce');
    $m = fn(string $key, mixed $default = '') => luxride_meta_value($post->ID, $key, $default);
    echo '<div class="luxride-admin-grid"><div>';
    echo '<div class="luxride-checks">';
    luxride_checkbox('Active', 'luxride_active', (bool) $m('luxride_active', true));
    luxride_checkbox('WiFi', 'luxride_wifi', (bool) $m('luxride_wifi', true));
    luxride_checkbox('Air Conditioning', 'luxride_air_conditioning', (bool) $m('luxride_air_conditioning', true));
    luxride_checkbox('Ice Box', 'luxride_ice_box', (bool) $m('luxride_ice_box', false));
    luxride_checkbox('USB / Charging', 'luxride_usb_charging', (bool) $m('luxride_usb_charging', true));
    echo '</div>';
    luxride_field('Display Order', 'menu_order', $post->menu_order, 'number');
    luxride_field('Vehicle Name / Model', 'post_title', get_the_title($post));
    luxride_select_field('Vehicle Class', 'luxride_trip_type', $m('luxride_trip_type', 'sedan'), ['sedan' => 'Sedan', 'mpv' => 'MPV', 'minivan' => 'Mini Van']);
    luxride_field('Vehicle Type Label EN', 'luxride_vehicle_type', $m('luxride_vehicle_type'));
    luxride_field('Vehicle Type Label AR', 'luxride_vehicle_type_ar', $m('luxride_vehicle_type_ar'));
    luxride_field('Passengers', 'luxride_passengers', $m('luxride_passengers', 1), 'number');
    luxride_field('Bags', 'luxride_baggage', $m('luxride_baggage', 1), 'number');
    echo '</div><div>';
    luxride_field('Summary EN', 'luxride_summary_en', $m('luxride_summary_en'), 'textarea');
    luxride_field('Summary AR', 'luxride_summary_ar', $m('luxride_summary_ar'), 'textarea', ['dir' => 'rtl']);
    luxride_field('Features EN', 'luxride_features_en', $m('luxride_features_en'));
    luxride_field('Features AR', 'luxride_features_ar', $m('luxride_features_ar'), 'text', ['dir' => 'rtl']);
    luxride_media_field('Vehicle Image', 'luxride_image_url', (string) $m('luxride_image_url'));
    echo '<p class="luxride-admin-note">Internal vehicle keys stay stable: sedan, mpv, minivan. The hidden source id is preserved for the system.</p>';
    echo '</div></div>';
}

function luxride_render_destination_box(WP_Post $post): void
{
    wp_nonce_field('luxride_friendly_meta', 'luxride_friendly_meta_nonce');
    $m = fn(string $key, mixed $default = '') => luxride_meta_value($post->ID, $key, $default);
    echo '<div class="luxride-admin-grid"><div>';
    luxride_checkbox('Show on site', 'luxride_active', (bool) $m('luxride_active', true));
    luxride_field('Order', 'menu_order', $post->menu_order, 'number');
    luxride_field('Title EN', 'post_title', get_the_title($post));
    luxride_field('Title AR', 'luxride_title_ar', $m('luxride_title_ar'));
    luxride_field('Description EN', 'post_content', $post->post_content, 'textarea');
    luxride_field('Description AR', 'luxride_description_ar', $m('luxride_description_ar'), 'textarea', ['dir' => 'rtl']);
    luxride_field('Pickup', 'luxride_route_from', $m('luxride_route_from'));
    luxride_field('Destination', 'luxride_route_to', $m('luxride_route_to'));
    luxride_field('Display Pickup EN', 'luxride_display_from_en', $m('luxride_display_from_en'));
    luxride_field('Display Pickup AR', 'luxride_display_from_ar', $m('luxride_display_from_ar'), 'text', ['dir' => 'rtl']);
    luxride_field('Display Destination EN', 'luxride_display_to_en', $m('luxride_display_to_en'));
    luxride_field('Display Destination AR', 'luxride_display_to_ar', $m('luxride_display_to_ar'), 'text', ['dir' => 'rtl']);
    echo '</div><div>';
    luxride_field('Section EN', 'luxride_group_en', $m('luxride_group_en'));
    luxride_field('Section AR', 'luxride_group_ar', $m('luxride_group_ar'), 'text', ['dir' => 'rtl']);
    luxride_field('Context', 'luxride_context', $m('luxride_context', 'destination'));
    luxride_field('Duration', 'luxride_duration', $m('luxride_duration'));
    luxride_field('From Price EUR', 'luxride_from_price', $m('luxride_from_price', 0), 'number', ['step' => '0.01']);
    luxride_checkbox('Airport fee badge', 'luxride_airport_fee', (bool) $m('luxride_airport_fee', false));
    luxride_checkbox('Permit required badge', 'luxride_permit_required', (bool) $m('luxride_permit_required', false));
    luxride_media_field('Featured Image', 'luxride_image_url', (string) $m('luxride_image_url'));
    luxride_field('Image Position', 'luxride_image_position', $m('luxride_image_position', 'center'));
    luxride_field('Image Alt EN', 'luxride_image_alt_en', $m('luxride_image_alt_en'));
    luxride_field('Image Alt AR', 'luxride_image_alt_ar', $m('luxride_image_alt_ar'), 'text', ['dir' => 'rtl']);
    echo '<p class="luxride-admin-note">Public destination cards are curated records only. Do not create 320 calculator routes here.</p>';
    echo '</div></div>';
}

function luxride_render_experience_box(WP_Post $post): void
{
    wp_nonce_field('luxride_friendly_meta', 'luxride_friendly_meta_nonce');
    $m = fn(string $key, mixed $default = '') => luxride_meta_value($post->ID, $key, $default);
    echo '<div class="luxride-admin-grid"><div>';
    luxride_checkbox('Published / Active', 'luxride_active', (bool) $m('luxride_active', true));
    luxride_field('Display Order', 'menu_order', $post->menu_order, 'number');
    luxride_field('English Title', 'post_title', get_the_title($post));
    luxride_field('English Story / Description', 'post_content', $post->post_content, 'textarea');
    luxride_field('English Summary', 'luxride_summary_en', $m('luxride_summary_en'), 'textarea');
    luxride_field('Arabic Title', 'luxride_title_ar', $m('luxride_title_ar'), 'text', ['dir' => 'rtl']);
    luxride_field('Arabic Story / Description', 'luxride_description_ar', $m('luxride_description_ar'), 'textarea', ['dir' => 'rtl']);
    luxride_field('Arabic Summary', 'luxride_summary_ar', $m('luxride_summary_ar'), 'textarea', ['dir' => 'rtl']);
    echo '</div><div>';
    luxride_field('Pickup', 'luxride_booking_from', $m('luxride_booking_from'));
    luxride_field('Destination', 'luxride_booking_to', $m('luxride_booking_to'));
    luxride_select_field('Trip Type', 'luxride_booking_trip', $m('luxride_booking_trip', 'oneWay'), ['oneWay' => 'One Way', 'roundTrip' => 'Round Trip']);
    luxride_select_field('Vehicle', 'luxride_vehicle_en', $m('luxride_vehicle_en', 'Mitsubishi Xpander 2027'), ['Toyota Corolla' => 'Toyota Corolla', 'Mitsubishi Xpander 2027' => 'Mitsubishi Xpander 2027', 'Toyota HiAce' => 'Toyota HiAce']);
    luxride_field('Vehicle AR', 'luxride_vehicle_ar', $m('luxride_vehicle_ar', $m('luxride_vehicle_en')), 'text', ['dir' => 'rtl']);
    luxride_field('Route Type EN', 'luxride_route_type_en', $m('luxride_route_type_en', 'Round Trip Transfer'));
    luxride_field('Route Type AR', 'luxride_route_type_ar', $m('luxride_route_type_ar', 'توصيلة ذهاب وعودة'), 'text', ['dir' => 'rtl']);
    luxride_media_field('Featured Image', 'luxride_image_url', (string) $m('luxride_image_url'));
    luxride_gallery_field((string) $m('luxride_gallery_urls', '[]'));
    luxride_media_field('Optional Video MP4', 'luxride_video_url', (string) $m('luxride_video_url'), 'video');
    luxride_media_field('Video Poster', 'luxride_video_poster_url', (string) $m('luxride_video_poster_url'));
    echo '<p class="luxride-admin-note">Recommended video: 16:9, MP4/H.264, master 1920x1080, optimized web 1280x720.</p>';
    echo '</div></div>';
}

function luxride_render_faq_box(WP_Post $post): void
{
    wp_nonce_field('luxride_friendly_meta', 'luxride_friendly_meta_nonce');
    $m = fn(string $key, mixed $default = '') => luxride_meta_value($post->ID, $key, $default);
    luxride_checkbox('Active', 'luxride_active', (bool) $m('luxride_active', true));
    echo '<div class="luxride-admin-grid"><div>';
    luxride_field('Display Order', 'menu_order', $post->menu_order, 'number');
    luxride_select_field('FAQ Location', 'luxride_faq_context', $m('luxride_faq_context', 'page'), ['home' => 'Home FAQ', 'page' => 'FAQ Page']);
    luxride_field('Question EN', 'post_title', get_the_title($post));
    luxride_field('Answer EN', 'post_content', $post->post_content, 'textarea');
    echo '</div><div>';
    luxride_field('Question AR', 'luxride_question_ar', $m('luxride_question_ar'), 'text', ['dir' => 'rtl']);
    luxride_field('Answer AR', 'luxride_answer_ar', $m('luxride_answer_ar'), 'textarea', ['dir' => 'rtl']);
    echo '<p class="luxride-admin-note">Keep approved content: flight delay includes free waiting up to 3 hours; child seat is free.</p>';
    echo '</div></div>';
}

function luxride_save_friendly_meta_boxes(int $post_id, WP_Post $post): void
{
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!in_array($post->post_type, ['luxride_vehicle', 'luxride_destination', 'luxride_experience', 'luxride_faq'], true)) {
        return;
    }
    if (!isset($_POST['luxride_friendly_meta_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['luxride_friendly_meta_nonce'])), 'luxride_friendly_meta')) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $input = isset($_POST['luxride_meta']) && is_array($_POST['luxride_meta']) ? wp_unslash($_POST['luxride_meta']) : [];
    $post_fields = [];
    foreach (['post_title', 'post_content', 'menu_order'] as $post_key) {
        if (array_key_exists($post_key, $input)) {
            $post_fields[$post_key] = 'menu_order' === $post_key ? (int) $input[$post_key] : sanitize_textarea_field((string) $input[$post_key]);
            unset($input[$post_key]);
        }
    }
    if ($post_fields) {
        remove_action('save_post', 'luxride_save_friendly_meta_boxes', 10);
        wp_update_post(array_merge(['ID' => $post_id], $post_fields));
        add_action('save_post', 'luxride_save_friendly_meta_boxes', 10, 2);
    }

    $checkboxes = [
        'luxride_active',
        'luxride_wifi',
        'luxride_air_conditioning',
        'luxride_ice_box',
        'luxride_usb_charging',
        'luxride_airport_fee',
        'luxride_permit_required',
    ];
    foreach ($checkboxes as $key) {
        if (array_key_exists($key, $input) || metadata_exists('post', $post_id, $key)) {
            update_post_meta($post_id, $key, isset($input[$key]) ? '1' : '0');
        }
        unset($input[$key]);
    }

    foreach ($input as $key => $value) {
        $key = sanitize_key((string) $key);
        if ('luxride_gallery_urls' === $key || 'luxride_tags_en' === $key || 'luxride_tags_ar' === $key) {
            update_post_meta($post_id, $key, luxride_sanitize_json_list((string) $value));
            continue;
        }
        if (str_contains($key, '_url')) {
            update_post_meta($post_id, $key, luxride_sanitize_media_reference((string) $value));
            continue;
        }
        if (str_contains($key, 'passengers') || str_contains($key, 'baggage')) {
            update_post_meta($post_id, $key, absint($value));
            continue;
        }
        if (str_contains($key, 'price') || str_contains($key, 'discount')) {
            update_post_meta($post_id, $key, (float) $value);
            continue;
        }
        update_post_meta($post_id, $key, sanitize_textarea_field((string) $value));
    }

    if ('luxride_experience' === $post->post_type && empty($input['luxride_gallery_urls']) && !empty($input['luxride_image_url'])) {
        update_post_meta($post_id, 'luxride_gallery_urls', wp_json_encode([luxride_sanitize_media_reference((string) $input['luxride_image_url'])], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
}

function luxride_sanitize_media_reference(string $value): string
{
    $value = trim($value);
    if ('' === $value) {
        return '';
    }
    return preg_match('#^https?://#', $value) ? esc_url_raw($value) : sanitize_text_field($value);
}

function luxride_sanitize_json_list(string $value): string
{
    $decoded = json_decode($value, true);
    if (!is_array($decoded)) {
        $decoded = array_filter(array_map('trim', explode("\n", $value)));
    }
    $clean = [];
    foreach ($decoded as $item) {
        $item = luxride_sanitize_media_reference((string) $item);
        if ('' !== $item) {
            $clean[] = $item;
        }
    }
    return wp_json_encode(array_values($clean), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}
