import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";

export default class HomeProductRoller extends Component {
  @service siteSettings;
  @service router;

  @tracked index = 0;
  @tracked pageSize = 3; // default (will be overwritten by settings)
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

  
  get isDesktop() {
    return (window?.innerWidth || 0) >= 1024;
  }

  get columns() {
    const ss = this.siteSettings;
    const fallback = this.isDesktop ? 4 : 3;
    const raw = this.isDesktop ? ss.home_product_roller_desktop_columns : ss.home_product_roller_mobile_columns;
    const n = Number(raw);
    const v = Number.isFinite(n) ? n : fallback;
    return Math.max(1, Math.min(12, v));
  }

  get rows() {
    const ss = this.siteSettings;
    const fallback = 1;
    const raw = this.isDesktop ? ss.home_product_roller_desktop_rows : ss.home_product_roller_mobile_rows;
    const n = Number(raw);
    const v = Number.isFinite(n) ? n : fallback;
    return Math.max(1, Math.min(10, v));
  }

  get gridStyle() {
    // inline style to win over other theme rules
    return `grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`;
  }

  @action updatePageSize() {
    const target = this.columns * this.rows;
    if (target !== this.pageSize) {
      this.pageSize = target;
      const len = this.products.length || 1;
      this.index = Math.floor(this.index / target) * target % len;
    }
  }

  _startAutoplay() {
    const ss = this.siteSettings;
    if (!ss.home_product_roller_autoplay_enabled) return;
    const sec = Math.max(1, Number(ss.home_product_roller_autoplay_seconds) || 5);
    this._autoplayTimer = window.setInterval(() => this.next(), sec * 1000);
  }

  _stopAutoplay() {
    if (this._autoplayTimer) {
      window.clearInterval(this._autoplayTimer);
      this._autoplayTimer = null;
    }
  }

  @action setup() {
    this.updatePageSize();
    this._resizeHandler = () => this.updatePageSize();
    window.addEventListener("resize", this._resizeHandler);
    this._startAutoplay();
  }

  @action teardown() {
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
    this._stopAutoplay();
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
