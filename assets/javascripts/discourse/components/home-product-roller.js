import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class HomeProductRoller extends Component {
  @service siteSettings;
  @service router;

  @tracked index = 0;
  @tracked pageSize = 2; // mobile default
  _resizeHandler = null;

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
    const name = this.router?.currentRouteName || "";
    return name.startsWith("discovery.") || name === "discovery" || name.startsWith("categories");
  }

  get visibleItems() {
    const items = this.products;
    const size = this.pageSize;
    const len = items.length;
    if (len === 0) return [];
    const out = [];
    for (let i = 0; i < size; i++) {
      const itm = items[(this.index + i) % len] || items[0];
      out.push(itm);
    }
    return out;
  }

  @action updatePageSize() {
    // >=1024px -> 4 per page else 2
    const target = window?.innerWidth >= 1024 ? 4 : 2;
    if (target !== this.pageSize) {
      this.pageSize = target;
      // snap index to page boundary to avoid mid-page shifts
      const len = this.products.length || 1;
      this.index = Math.floor(this.index / target) * target % len;
    }
  }

  @action setup() {
    this.updatePageSize();
    this._resizeHandler = () => this.updatePageSize();
    window.addEventListener("resize", this._resizeHandler);
  }

  @action teardown() {
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
  }

  @action next() {
    const len = this.products.length;
    if (len > 0) {
      this.index = (this.index + this.pageSize) % len;
    }
  }

  @action prev() {
    const len = this.products.length;
    if (len > 0) {
      const step = this.pageSize;
      this.index = ((this.index - step) % len + len) % len;
    }
  }
}
