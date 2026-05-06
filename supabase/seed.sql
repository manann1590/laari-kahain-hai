insert into public.reports
  (
    issue_type, title, description, menu_text, vendor_phone, vendor_whatsapp,
    cuisine_tags, price_range, hours_text, latitude, longitude, address_text,
    area, district, status, severity, image_url, approved_at
  )
values
  ('pothole', 'Raju Bhai Cheese Vada Pav', 'Cheese vada pav, masala bun, cold coffee.', 'Cheese vada pav 45\nMasala bun 35\nCold coffee 70\nBest seller: double cheese vada pav', '+91 98765 43210', '+91 98765 43210', 'veg, spicy, cheesy, snacks', '₹35-₹90', '5 PM - 11 PM', 23.0301, 72.5086, 'Near Satellite Road', 'Satellite', 'Ahmedabad', 'approved', 'medium', null, timezone('utc', now())),
  ('garbage', 'Vastrapur Mini Thali Van', 'Gujarati thali, dal rice, paratha, chaas.', 'Mini thali 120\nDal rice 80\nAloo paratha 70\nChaas 20', '+91 98765 43211', '+91 98765 43211', 'veg, thali, lunch, dinner', '₹70-₹160', '12 PM - 3 PM, 7 PM - 10 PM', 23.0396, 72.5293, 'Vastrapur Lake area', 'Vastrapur', 'Ahmedabad', 'approved', 'medium', null, timezone('utc', now())),
  ('waterlogging', 'Bopal Burger Cart', 'Burgers, fries, wraps, peri peri momos.', 'Aloo tikki burger 60\nPaneer wrap 110\nPeri peri fries 90\nVeg momos 80', '+91 98765 43212', '+91 98765 43212', 'burgers, momos, fast food', '₹60-₹140', '6 PM - 12 AM', 23.0339, 72.4637, 'Bopal main road', 'Bopal', 'Ahmedabad', 'approved', 'medium', null, timezone('utc', now())),
  ('broken_streetlight', 'Prahladnagar Cutting Chai', 'Masala chai, bun maska, coffee, iced tea.', 'Cutting chai 15\nBun maska 35\nCold coffee 70\nLemon iced tea 50', '+91 98765 43213', '+91 98765 43213', 'chai, coffee, bun maska', '₹15-₹80', '7 AM - 11 AM, 5 PM - 10 PM', 23.0129, 72.5073, 'Prahladnagar Garden Road', 'Prahladnagar', 'Ahmedabad', 'approved', 'low', null, timezone('utc', now())),
  ('damaged_road', 'Maninagar Dosa Corner', 'Dosa, idli, uttapam, filter coffee.', 'Masala dosa 90\nMysore dosa 120\nIdli plate 50\nFilter coffee 40', '+91 98765 43214', '+91 98765 43214', 'south indian, dosa, breakfast', '₹40-₹140', '8 AM - 1 PM, 6 PM - 10 PM', 22.9978, 72.6084, 'Near Maninagar station road', 'Maninagar', 'Ahmedabad', 'approved', 'medium', null, timezone('utc', now())),
  ('damaged_footpath', 'CG Road Kulfi Stop', 'Kulfi, falooda, rabdi, waffles.', 'Malai kulfi 50\nFalooda 110\nRabdi cup 90\nChocolate waffle 130', '+91 98765 43215', '+91 98765 43215', 'dessert, kulfi, sweet', '₹50-₹150', '7 PM - 12 AM', 23.0365, 72.5611, 'CG Road side lane', 'Navrangpura', 'Ahmedabad', 'approved', 'low', null, timezone('utc', now())),
  ('open_manhole', 'Gota Juice Lari', 'Fresh juice, soda, shakes, lassi.', 'Mosambi juice 60\nSitafal shake 120\nMasala soda 35\nSweet lassi 70', '+91 98765 43216', '+91 98765 43216', 'juice, shakes, summer', '₹35-₹130', '10 AM - 10 PM', 23.1013, 72.5407, 'Gota main road', 'Gota', 'Ahmedabad', 'approved', 'low', null, timezone('utc', now())),
  ('damaged_public_property', 'Kankaria Wok Cart', 'Noodles, fried rice, manchurian, chilli paneer.', 'Hakka noodles 100\nFried rice 100\nManchurian 120\nChilli paneer 150', '+91 98765 43217', '+91 98765 43217', 'chinese, spicy, dinner', '₹100-₹180', '6 PM - 11:30 PM', 22.9960, 72.5996, 'Kankaria approach road', 'Kankaria', 'Ahmedabad', 'approved', 'medium', null, timezone('utc', now())),
  ('garbage', 'Pending Khanpur Thali', 'Needs review before publishing.', 'Menu pending review.', '+91 98765 43218', '+91 98765 43218', 'thali, lunch', '₹80-₹140', '12 PM - 3 PM', 23.0258, 72.5873, 'Khanpur lane', 'Khanpur', 'Ahmedabad', 'pending', 'medium', null, null);

insert into public.report_events (report_id, event_type, new_status, note)
select id, 'created', status, 'Seed vendor listing created.'
from public.reports
where title in (
  'Raju Bhai Cheese Vada Pav',
  'Vastrapur Mini Thali Van',
  'Bopal Burger Cart',
  'Prahladnagar Cutting Chai',
  'Maninagar Dosa Corner',
  'CG Road Kulfi Stop',
  'Gota Juice Lari',
  'Kankaria Wok Cart',
  'Pending Khanpur Thali'
);
