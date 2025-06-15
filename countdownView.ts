import { ItemView, WorkspaceLeaf } from 'obsidian';
import SimpleCountdownPlugin from './main';

export const VIEW_TYPE_COUNTDOWN = 'countdown-view';

export class CountdownView extends ItemView {
  plugin: SimpleCountdownPlugin;
  private intervalId: number | null = null;
  private countdownEl: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SimpleCountdownPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_COUNTDOWN;
  }

  getDisplayText(): string {
    return 'Simple Countdown';
  }

  getIcon(): string {
    return 'calendar-clock';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();

    this.countdownEl = container.createDiv({ cls: 'countdown-widget' });
    this.updateCountdown();
    this.intervalId = window.setInterval(
      () => this.updateCountdown(),
      60 * 1000
    );
  }

  updateCountdown() {
    if (!this.countdownEl) return;

    const now = new Date();
    const targetDate = new Date(this.plugin.settings.targetDate + 'T00:00:00');

    // Clear existing content
    this.countdownEl.empty();

    if (isNaN(targetDate.getTime())) {
      // Create error elements using DOM API
      const errorEl = this.countdownEl.createDiv({ cls: 'countdown-error' });
      errorEl.textContent = 'Invalid date format';
      
      const eventEl = this.countdownEl.createDiv({ cls: 'countdown-event' });
      eventEl.textContent = this.plugin.settings.eventName;
      return;
    }

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    let displayText: string;
    let labelText: string;
    let showDateFooter: boolean;

    if (diffDays === 0) {
      displayText = 'Today';
      labelText = '';
      showDateFooter = false;
    } else if (diffDays > 0) {
      displayText = diffDays.toString();
      labelText = diffDays === 1 ? 'day left' : 'days left';
      showDateFooter = true;
    } else {
      displayText = Math.abs(diffDays).toString();
      labelText = Math.abs(diffDays) === 1 ? 'day ago' : 'days ago';
      showDateFooter = true;
    }

    // Create elements using DOM API
    const daysEl = this.countdownEl.createDiv({ cls: 'countdown-days' });
    daysEl.textContent = displayText;

    const labelEl = this.countdownEl.createDiv({ cls: 'countdown-label' });
    labelEl.textContent = labelText;

    const eventEl = this.countdownEl.createDiv({ cls: 'countdown-event' });
    eventEl.textContent = this.plugin.settings.eventName;

    if (showDateFooter) {
      const dateFooterEl = this.countdownEl.createDiv({ cls: 'countdown-date-footer' });
      dateFooterEl.textContent = this.plugin.settings.targetDate;
    }
  }

  async onClose() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
