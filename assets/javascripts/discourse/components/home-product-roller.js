import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class HomeProductRoller extends Component {
  @service siteSettings;
  @service router;

  @tracked index = 0;

  get products() {
    const ss = this.siteSettings;
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const img = ss[`product_image_url_${i}`];
      const link = ss[`product_link_url_${i}`];
      if (img && link) {
        list.push({ image: img, link });
      }
    }
    return list;
  }

  get shouldShow() {
    if (!this.siteSettings.home_product_roller_enabled) return false;
    if (this.products.length === 0) return false;
    // Only show on discovery routes (home pages)
    const name = this.router?.currentRouteName || "";
    return name.startsWith("discovery.") || name === "discovery" || name.startsWith("categories");
  }

  get visibleItems() {
    const items = this.products;
    if (items.length === 0) return [];
    if (items.length === 1) return [items[0], items[0]]; // duplicate to fill two slots
    const a = items[this.index % items.length];
    const b = items[(this.index + 1) % items.length];
    return [a, b];
  }

  @action next() {
    if (this.products.length > 0) {
      this.index = (this.index + 2) % this.products.length;
    }
  }

  @action prev() {
    if (this.products.length > 0) {
      // move back by 2, wrap positive
      const len = this.products.length;
      this.index = ((this.index - 2) % len + len) % len;
    }
  }
}
