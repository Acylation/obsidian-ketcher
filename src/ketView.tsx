import { Ketcher } from "ketcher-core";
import { Notice, TextFileView, WorkspaceLeaf } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import KetcherReact from "./KetcherReact";

export const VIEW_TYPE_KET = "ket-view";

export class KetView extends TextFileView {
	ketcher: Ketcher;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
		const container = this.containerEl.children[1];
		ReactDOM.render(
			<React.StrictMode>
				<KetcherReact
					data={this.data}
					onInit={(ketcher: Ketcher) => {
						this.ketcher = ketcher;
						// https://github.com/epam/ketcher/issues/2250
						// @ts-ignore
						global.ketcher = ketcher;
					}}
				/>
			</React.StrictMode>,
			container
		);
	}

	getViewData() {
		return this.data;
	}

	// If clear is set, then it means we're opening a completely different file.
	setViewData(data: string, _clear: boolean) {
		this.data = data;

		if (_clear) {
			this.ketcher.editor.clear();
			this.ketcher.setMolecule(this.data);
			//@ts-ignore undocumented
			this.ketcher.editor.historyStack = [];
		}
	}

	clear() { }

	getViewType() {
		return VIEW_TYPE_KET;
	}

	async onOpen() {
		this.addAction("save", "Save", async (_eventType) => {
			try {
				this.data = await this.ketcher.getKet();
				await this.save(); // will call `getViewData`
				new Notice("Your structures/reactions have been saved."); // https://stackoverflow.design/content/examples/success-messages/
			} catch (error) {
				new Notice(error);
			}
		});
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
		await super.onClose();
	}
}
