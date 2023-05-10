// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Functions
	let listSensitiveFiles = vscode.commands.registerCommand('stream-safe.listSensitiveFiles', function () {
		const config = vscode.workspace.getConfiguration();
		const sensitiveFiles = config.get('sensitiveFiles');

		vscode.window.showInformationMessage(`Your sensitive files: ${sensitiveFiles.toString()}`)
		console.log(sensitiveFiles)

	});

	let addThisFileByPalette = vscode.commands.registerCommand('stream-safe.addThisFileByPalette', function () {
		// Get the active editor
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showErrorMessage('No active editor found.');
		  return;
		}
	  
		// Get the file path of the active editor
		const filePath = editor.document.uri.fsPath;
	  
		// Get the current sensitive files
		const config = vscode.workspace.getConfiguration();
		const sensitiveFiles = config.get('sensitiveFiles');
	  
		// Add the new file to the sensitive files
		sensitiveFiles.push(filePath);
	  
		// Save the updated sensitive files to the configuration
		config.update('sensitiveFiles', sensitiveFiles, vscode.ConfigurationTarget.Global);
	  
		// Show a message to the user
		vscode.window.showInformationMessage(`Added ${filePath} to sensitive files.`);
	})
	
	let deleteFromSensitiveFiles = vscode.commands.registerCommand('stream-safe.deleteThisFileByPalette', function () {
		// Get the active editor
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showErrorMessage('No active editor found.');
		  return;
		}
	  
		// Get the file path of the active editor
		const filePath = editor.document.uri.fsPath;
	  
		// Get the current sensitive files
		const config = vscode.workspace.getConfiguration();
		const sensitiveFiles = config.get('sensitiveFiles');
	  
		// Check if the file is in the sensitive files array
		const index = sensitiveFiles.indexOf(filePath);
		if (index === -1) {
		  vscode.window.showInformationMessage(`${filePath} is not in sensitive files.`);
		  return;
		}
	  
		// Remove the file from the sensitive files
		sensitiveFiles.splice(index, 1);
	  
		// Save the updated sensitive files to the configuration
		config.update('sensitiveFiles', sensitiveFiles, vscode.ConfigurationTarget.Global);
	  
		// Show a message to the user
		vscode.window.showInformationMessage(`Removed ${filePath} from sensitive files.`);
	})

	// Currently not working
	let addToSensitiveFilesFromMenu = vscode.commands.registerCommand('stream-safe.addToSensitiveFilesFromMenu', function () {
		// Get the selected file in the Explorer panel
		const selectedFile = vscode.window.activeTextEditor.document.uri.fsPath;
		if (!selectedFile) {
		  vscode.window.showErrorMessage('No file selected.');
		  return;
		}
	  
		// Get the current sensitive files
		const config = vscode.workspace.getConfiguration();
		const sensitiveFiles = config.get('sensitiveFiles');
	  
		// Check if the file is already in the sensitive files array
		if (sensitiveFiles.includes(selectedFile)) {
		  vscode.window.showInformationMessage(`${selectedFile} is already in sensitive files.`);
		  return;
		}
	  
		// Add the file to the sensitive files array
		sensitiveFiles.push(selectedFile);
	  
		// Save the updated sensitive files to the configuration
		config.update('sensitiveFiles', sensitiveFiles, vscode.ConfigurationTarget.Global);
	  
		// Show a message to the user
		vscode.window.showInformationMessage(`Added ${selectedFile} to sensitive files.`);
	})
	
	// On window warning
	vscode.window.onDidChangeActiveTextEditor((editor) => {
		const sensitiveFiles = vscode.workspace.getConfiguration().get('sensitiveFiles') || [];
		let fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length));
		let theme = vscode.workspace.getConfiguration().get('workbench.colorTheme')
		let activeColor = new vscode.ThemeColor(`editor.foreground`, theme)

		let blurDecorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: activeColor,
			isWholeLine: true
		  });

		if(!editor) {
			console.log('no editor selected')
			return
		}

		if (sensitiveFiles.includes(editor.document.fileName)) {
			console.log(`sensitive file: ${editor.document.fileName}`)
			editor.setDecorations(blurDecorationType, [ { range: fullRange } ]);
			vscode.window.showInformationMessage('This file was marked as sensitive. Do you want to proceed?', { modal: true }, 'Yes', 'No', 'Remove From Sensitive Files').then((selection) => {
				if (selection === 'Yes') {
				  	editor.setDecorations(blurDecorationType, [])
				} else if(selection === 'Remove From Sensitive Files') {
					const index = sensitiveFiles.indexOf(editor.document.fileName);
					if (index === -1) {
						console.log(`${editor.document.fileName} not in sensitive files`)
					  return;
					}
					sensitiveFiles.splice(index, 1);
					vscode.workspace.getConfiguration().update('sensitiveFiles', sensitiveFiles, vscode.ConfigurationTarget.Global);
					console.log(`sensitive files: ${vscode.workspace.getConfiguration().get('sensitiveFiles')}`)
					editor.setDecorations(blurDecorationType, [])
				} else {
					vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			  });
		}

	})

	// Context subscriptions
	context.subscriptions.push(listSensitiveFiles);
	context.subscriptions.push(addThisFileByPalette);
	context.subscriptions.push(deleteFromSensitiveFiles)
	context.subscriptions.push(addToSensitiveFilesFromMenu);

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
