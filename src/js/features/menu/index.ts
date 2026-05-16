interface ToggleEvent extends Event {
  readonly newState: "open" | "closed";
  readonly oldState: "open" | "closed";
}

export class PopoverSupport {
  el: HTMLElement[];
  popoverMap: Map<string, {
    popover: HTMLElement;
    toggler: HTMLElement;
  }>;

  constructor(selector: string = '[popovertarget]') {
    this.el = [...document.querySelectorAll(selector)] as HTMLElement[];
    this.popoverMap = new Map();

    if (!this.el.length) {
      throw new Error(`Element not found for selector: ${selector}`);
    }
    this.initialize();
  }

  initialize() {
    this.handleToggle = this.handleToggle.bind(this);

    this.el.forEach((el) => {
      const id = el.getAttribute('popovertarget');
      if (!id) {
        return;
      }
      const popover = document.getElementById(id);

      if (!popover) {
        return;
      }

      popover.addEventListener('toggle', this.handleToggle);

      this.popoverMap.set(id, {
        popover,
        toggler: el,
      });

      el.setAttribute('aria-haspopup', 'false');
    });
  }

  handleToggle(e: Event) {
    const toggleEvent = e as ToggleEvent;
    const togglerEl = this.el.find((el) => el.getAttribute('popovertarget') === (toggleEvent.target as null | HTMLElement)?.id);

    togglerEl?.setAttribute('aria-haspopup', toggleEvent.newState === 'open' ? 'true' : 'false');
    document.documentElement.classList.remove(toggleEvent.newState === 'open' ? 'popover-closed' : 'popover-open');
    document.documentElement.classList.add(toggleEvent.newState === 'open' ? 'popover-open' : 'popover-closed');
  }

  handleCloseAll(e: Event) {
    this.popoverMap.forEach(({ popover, toggler }) => {
      popover.hidePopover();
      toggler.setAttribute('aria-haspopup', 'false');
    })
  }
}
