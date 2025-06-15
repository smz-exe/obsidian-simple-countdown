import { App, PluginSettingTab, Setting } from 'obsidian';
import SimpleCountdownPlugin from './main';

export class SimpleCountdownSettingTab extends PluginSettingTab {
  plugin: SimpleCountdownPlugin;
  private errorMessageEl: HTMLElement;

  constructor(app: App, plugin: SimpleCountdownPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  private isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date.getTime());
  }

  private showErrorMessage(message: string): void {
    if (this.errorMessageEl) {
      this.errorMessageEl.textContent = message;
      this.errorMessageEl.addClass('visible');
    }
  }

  private clearErrorMessage(): void {
    if (this.errorMessageEl) {
      this.errorMessageEl.removeClass('visible');
      this.errorMessageEl.textContent = '';
    }
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Simple Countdown Settings' });

    new Setting(containerEl)
      .setName('Event Name')
      .setDesc('The name of your countdown event.')
      .addText(text =>
        text
          .setPlaceholder('Event Name')
          .setValue(this.plugin.settings.eventName)
          .onChange(async value => {
            this.plugin.settings.eventName = value;
            await this.plugin.saveSettings();
          })
      );

    // Simple text input for target date
    new Setting(containerEl)
      .setName('Target Date')
      .setDesc('Enter target date in YYYY-MM-DD format (e.g., 2025-12-31)')
      .addText(text => {
        const inputEl = text.inputEl;

        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.plugin.settings.targetDate);

        inputEl.addEventListener('input', () => {
          this.clearErrorMessage();
        });
        inputEl.addEventListener('blur', async () => {
          const value = inputEl.value.trim();

          if (value === '') {
            return;
          }

          if (this.isValidDateFormat(value)) {
            this.plugin.settings.targetDate = value;
            await this.plugin.saveSettings();
          } else {
            this.showErrorMessage(
              'Invalid date format. Please use YYYY-MM-DD.'
            );
          }
        });
      });

    this.errorMessageEl = containerEl.createDiv({
      cls: 'setting-error-message',
    });
  }
}
