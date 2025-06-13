import { Plugin } from 'obsidian';
import { CountdownView, VIEW_TYPE_COUNTDOWN } from './countdownView';
import { SimpleCountdownSettingTab } from './simpleCountdownSettingTab';

export interface SimpleCountdownSettings {
  eventName: string;
  targetDate: string;
}

export const DEFAULT_SETTINGS: SimpleCountdownSettings = {
  eventName: 'My Event',
  targetDate: '2025-01-01',
};

export default class SimpleCountdownPlugin extends Plugin {
  settings: SimpleCountdownSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SimpleCountdownSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE_COUNTDOWN,
      leaf => new CountdownView(leaf, this)
    );

    this.addRibbonIcon('calendar-clock', 'Open Countdown', () => {
      this.activateView();
    });
  }

  async onunload() {
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_COUNTDOWN)
      .forEach(leaf => leaf.detach());
  }

  async activateView() {
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({
        type: VIEW_TYPE_COUNTDOWN,
        active: true,
      });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.updateAllViews();
  }

  updateAllViews() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_COUNTDOWN).forEach(leaf => {
      if (leaf.view instanceof CountdownView) {
        leaf.view.updateCountdown();
      }
    });
  }
}
