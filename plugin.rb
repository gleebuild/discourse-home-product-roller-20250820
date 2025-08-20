# frozen_string_literal: true
# name: discourse-home-product-roller-20250820
# about: Homepage product carousel showing two items per page; up to 20 items configurable via site settings
# version: 1.0.0
# authors: ChatGPT (GleeBuild helper)
# required_version: 3.0.0
# url: https://lebanx.com

enabled_site_setting :home_product_roller_enabled

register_asset 'stylesheets/common/home-product-roller.scss'

after_initialize do
  # Server-side not required for this feature.
end
