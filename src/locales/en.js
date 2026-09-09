/**
 * English UI strings.
 *
 * Mirrors src/locales/ru.js key for key. A missing key here is not an error:
 * translate() falls back to Russian, so an untranslated screen shows the
 * original wording instead of a blank or a raw key.
 */
export const en = {
  // --- Common ---------------------------------------------------------------
  'common.contact': 'Contact us',
  'common.catalog': 'Product catalog',
  'common.write_us': 'Write to us',
  'common.tagline': 'Ready for tomorrow',
  'common.language': 'Language',
  'common.language_switch': 'Change language',
  'common.terminal': 'Terminal',
  'common.system_terminal': 'System terminal',
  'common.menu_open': 'Open menu',
  'common.menu_close': 'Close menu',
  'common.home': 'Back to home',

  // --- Navigation -----------------------------------------------------------
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.about': 'About',
  'nav.contacts': 'Contacts',

  // --- Footer ---------------------------------------------------------------
  'footer.about': 'Next-generation engineering for industry, security and the projects still ahead.',
  'footer.connect': 'Get in touch',
  'footer.copyright': '© 2024 KAE Engineering.',

  // --- Home -----------------------------------------------------------------
  'home.hero_eyebrow': 'Professional radio communications',
  'home.hero_title_1': 'Engineering solutions',
  'home.hero_title_2': 'of a new generation',
  'home.scroll': 'Scroll down',
  'home.systems_title': 'Systems engineering',
  'home.cta_discuss': 'Discuss your project',
  'home.cta_equipment': 'Browse equipment',

  // --- Home: the eight screens of the packing list ---------------------------
  // Everything the site owner edits lives in the database (group “Home”).
  // What stays here belongs to the page itself: screen labels, the names of
  // the parts on the drawing, the supply stages and the document rows.
  // No figures and no specifications: what is missing shows as a placeholder.
  'home.screen_status': 'Status',
  'home.screen_directions': 'Directions',
  'home.screen_doing': 'What we do',
  'home.screen_nomenclature': 'Nomenclature',
  'home.screen_supply': 'Supply',
  'home.screen_documents': 'Documents',
  'home.screen_index': 'Screen index',

  'home.partner_status': 'Official Aselsan partner in Kazakhstan',
  'home.status_statement': 'Status evidenced by documents on request',

  'home.batch': 'batch',
  'home.radio_caption': 'Portable radio — parts',
  'home.part_antenna': 'Antenna',
  'home.part_antenna_role': 'Sends and receives the signal',
  'home.part_body': 'Body',
  'home.part_body_role': 'Protects the electronics on site',
  'home.part_battery': 'Battery',
  'home.part_battery_role': 'Powers the station',
  'home.part_speaker': 'Speaker',
  'home.part_speaker_role': 'Plays the incoming call',
  'home.part_ptt': 'PTT handset',
  'home.part_ptt_role': 'Remote transmit button',
  'home.part_clip': 'Belt clip',
  'home.part_clip_role': 'Mounts on the gear',

  'home.directions_title': 'Supply directions',
  'home.direction_application': 'application',

  'home.claim_2': 'Turnkey engineering and deployment',
  'home.claim_3': 'Service and support inside Kazakhstan',
  'home.claim_4': 'Public procurement and tender support',

  'home.nomenclature_title': 'Items by direction',
  'home.nomenclature_note': 'Part numbers and specifications on request.',
  'home.article': 'part number',
  'common.price_on_request': 'Price on request',

  'home.supply_title': 'Five stages of supply',
  'home.supply_design': 'Design',
  'home.supply_design_line': 'A solution built to the specification',
  'home.supply_install': 'Installation',
  'home.supply_install_line': 'Equipment mounted on site',
  'home.supply_commissioning': 'Commissioning',
  'home.supply_commissioning_line': 'Brought into service and checked',
  'home.supply_training': 'Training',
  'home.supply_training_line': 'The customer’s staff is prepared',
  'home.supply_service': 'Service',
  'home.supply_service_line': 'Warranty and service inside Kazakhstan',

  'home.documents_title': 'Procurement documents',
  'home.documents_note': 'Documents are provided at an organisation’s request.',
  'home.document_partner': 'Partner status confirmation',
  'home.document_conformity': 'Certificate of conformity',
  'home.document_permits': 'Permits and licences',
  'home.document_spec': 'Technical specification',
  'home.document_warranty': 'Warranty terms',
  'home.document_delivery': 'Delivery terms',
  'home.value': 'value',

  'home.destination': 'Destination',
  'home.address': 'address',
  'home.handling': 'Cargo handling',
  'home.handling_fragile': 'Fragile',
  'home.handling_up': 'This way up',
  'home.handling_dry': 'Keep dry',

  // --- Product showcase on the home page ------------------------------------
  'showcase.eyebrow': 'Products',
  'showcase.title': 'Equipment engineered in-house',
  'showcase.all': 'Full catalog',

  // --- Catalog --------------------------------------------------------------
  'products.eyebrow': 'Equipment catalog',
  'products.title': 'Our products',
  'products.intro':
    'Professional radio communication equipment: portable and mobile stations, base systems and repeaters. Price, lead time and configuration are sent on request from the item page.',
  'products.more': 'Learn more',
  'products.error_title': 'Could not load the catalog',
  'products.error_text':
    'Check your connection and reload the page — or write to us and we will send the equipment list.',
  'products.empty_title': 'The catalog is empty for now',
  'products.empty_text': 'Items will appear here once they are published.',
  'products.cta_title': 'Ready to start your project?',
  'products.cta_text': 'Talk to our engineers about specifications and scaling options.',
  'products.cta_button': 'Send a request',

  // --- Product page ---------------------------------------------------------
  'product.back': 'Back to catalog',
  'product.back_button': 'Return to catalog',
  'product.not_found_title': 'Product not found',
  'product.not_found_text': 'It may have been unpublished, or the address has changed.',
  'product.error_title': 'Could not load the product',
  'product.error_text': 'Check your connection and reload the page.',
  'product.request_price': 'Request a quote',
  'product.documentation': 'Documentation',
  'product.specs': 'Technical specifications',
  'product.applications': 'Applications',
  'product.size_mb': '{value} MB',
  'product.size_kb': '{value} KB',

  // --- Catalog: the nomenclature field --------------------------------------
  'catalog.rail': 'Nomenclature',
  'catalog.filter_label': 'Category',
  'catalog.uncategorized': 'No category',
  'catalog.count': 'Items in selection: {count}',
  'catalog.reset': 'Show every category',
  'catalog.open': 'Open',
  'catalog.price': 'Price on request',
  'catalog.no_photo': 'No photo',
  'catalog.photos': 'Photos: {count}',
  'catalog.empty_title': 'No category selected',
  'catalog.empty_text':
    'Every category stamp is off, so there is nothing to list. Bring the categories back to see the full nomenclature.',
  'catalog.note':
    'The list grows with every delivery. Prices, lead times and configuration are sent in reply to a request.',

  // --- Product page ---------------------------------------------------------
  'product.designation': 'Designation',
  'product.category_label': 'Category',
  'product.price_label': 'Price',
  'product.article_label': 'Part number',
  'product.no_data': 'no data',
  'product.photo_of': 'Photo {index} of {count}',
  'product.description_missing': 'No description has been supplied for this item.',
  'product.specs_missing_title': 'Specifications not supplied',
  'product.specs_missing_text':
    'The factory specifications for this item are not in the list yet. We do not fill them in from memory: in a tender, an invented figure costs more than a gap. Ask for the datasheet and we will send the manufacturer’s own.',

  // --- Quote request --------------------------------------------------------
  'quote.title': 'Request a commercial offer',
  'quote.intro':
    'Leave a contact and the task — we come back with the price, the lead time and the configuration for this item.',
  'quote.subject': 'Quote request: {name}',
  'quote.field_name': 'Name and organisation',
  'quote.field_email': 'Email',
  'quote.field_phone': 'Phone',
  'quote.field_message': 'Task, quantity, deadlines',
  'quote.hint_contact': 'Either one is enough: email or phone',
  'quote.required': 'Required field',
  'quote.error_name': 'Tell us who to address.',
  'quote.error_contact': 'Leave an email or a phone number — otherwise there is nowhere to reply.',
  'quote.error_email': 'Check the email address.',
  'quote.error_send': 'Could not send the request.',
  'quote.submit': 'Send the request',
  'quote.sending': 'Sending…',
  'quote.success_title': 'Request received',
  'quote.success_text': 'We reply within a business day. If the deadline is tight, call us directly.',
  'quote.success_again': 'Send another one',

  // --- About ----------------------------------------------------------------
  'about.title': 'About the company',
  'about.rail': 'About us',
  'about.claims_title': 'What is confirmed',
  'about.intro_placeholder': 'company description',
  'about.value_placeholder': 'value',
  'about.position_placeholder': 'position',
  'about.team_empty_title': 'The roster is still empty',
  'about.team_empty_text': 'People will appear here once they are added in the control panel.',

  // --- Contacts -------------------------------------------------------------
  'contacts.eyebrow': 'Get in touch',
  'contacts.title': 'Contacts',
  'contacts.rail': 'Contacts',
  'contacts.details_title': 'Details',
  'contacts.office': 'Head office',
  'contacts.email_label': 'Email',
  'contacts.phone_label': 'Phone',
  'contacts.map_title': 'How to find us',
  'contacts.open_map': 'Open in maps',
  'contacts.intro_placeholder': 'intro',
  'contacts.address_placeholder': 'address',
  'contacts.email_placeholder': 'email',
  'contacts.phone_placeholder': 'phone',
  'contacts.map_placeholder': 'how to find us',
  'contacts.form_title': 'Write to us',
  'contacts.product_request': 'Request about:',
  'contacts.subject_price': 'Quote request: {name}',
  'contacts.field_name': 'Name',
  'contacts.field_name_placeholder': 'John Smith',
  'contacts.field_email': 'Email',
  'contacts.field_email_placeholder': 'john@example.com',
  'contacts.field_subject': 'Subject',
  'contacts.field_subject_placeholder': 'Partnership enquiry',
  'contacts.field_message': 'Message',
  'contacts.field_message_placeholder': 'Describe your task…',
  'contacts.submit': 'Send',
  'contacts.submitting': 'Sending…',
  'contacts.required_note': 'Fields marked with an asterisk are required',
  'contacts.send_error': 'Could not send the request.',
  'contacts.success_title': 'Request received',
  'contacts.success_text': 'We will get back to you within a business day. If it is urgent, please call us directly.',
  'contacts.success_again': 'Send another one',

  // --- 404 ------------------------------------------------------------------
  'notfound.eyebrow': 'Error 404',
  'notfound.title': 'Page not found',
  'notfound.text': 'There is no such address on this site. The page may have moved, or the link has a typo.',
  'notfound.help_before': 'Did not find what you need?',
  'notfound.help_link': 'Write to us',
  'notfound.help_after': '— we will point you the right way.',

  // --- Error screen ---------------------------------------------------------
  'error.title': 'Something went wrong',
  'error.text':
    'The page failed to render. Try reloading it — if the error repeats, write to us and we will look into it.',
  'error.reload': 'Reload the page',

  // --- Admin unavailable (static demo build) --------------------------------
  'admin_off.title': 'Admin panel unavailable',
  'admin_off.text':
    'This is a showcase build of the site: it displays the content but runs without a server. The admin panel is available on the main deployment.',
  'admin_off.back': 'Back to the site',

  // --- Tab titles and page descriptions -------------------------------------
  'meta.home.title': 'KAE Engineering | Next-generation engineering solutions',
  'meta.home.description':
    'Engineering solutions and professional radio communication equipment for the industry and infrastructure of Kazakhstan.',
  'meta.products.title': 'KAE Engineering | Our products',
  'meta.products.description':
    'KAE Engineering product catalog: radio stations, repeaters and engineering equipment with specifications and documentation.',
  'meta.product.title': 'KAE Engineering | Product details',
  'meta.product.description': 'Specifications, applications and documentation for KAE Engineering equipment.',
  'meta.product.not_found_title': 'Product not found | KAE Engineering',
  'meta.product.not_found_description': 'There is no such product in the catalog.',
  'meta.about.title': 'KAE Engineering | About the company',
  'meta.about.description':
    'About KAE Engineering: engineering expertise, the team and our approach to building technology in Kazakhstan.',
  'meta.contacts.title': 'Contacts | KAE Engineering',
  'meta.contacts.description':
    'KAE Engineering contacts: office address in Astana, phone, email and a form to request a commercial offer.',
  'meta.404.title': 'Page not found | KAE Engineering',
  'meta.404.description': 'There is no such address on this site.',
};
