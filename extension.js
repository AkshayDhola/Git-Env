const vscode = require("vscode");
const axios = require("axios");
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "git-env" is now active!');
  const name = context.globalState.get("user_name");
  const token = context.globalState.get("user_token");
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0];
  const update_user = async () => {
    const user_name = await vscode.window.showInputBox({
      prompt: "Github Name",
    });
    const user_token = await vscode.window.showInputBox({
      prompt: "Github Access Token",
    });
    context.globalState.update("user_name", user_name);
    context.globalState.update("user_token", user_token);
  };
  const AddToRepo = (repo_name) => {
    try {
      const terminal =
        vscode.window.activeTerminal ||
        vscode.window.createTerminal("Run Command");
      const dependenices = [
        `git init`,
        `git add .`,
        `git commit -m "first commit"`,
        `git branch -M main`,
        `git remote add origin https://github.com/${name}/${repo_name}.git`,
        `git push -u origin main`,
      ];
      dependenices.map((dpn) => terminal.sendText(`${dpn}`));
    } catch (error) {}
  };
  const ChangesRepo = (repo_name) => {
    try {
      const terminal =
        vscode.window.activeTerminal ||
        vscode.window.createTerminal("Run Command");
      const dependenices = [
        `git add .`,
        `git commit -m "Commit message describing the changes"`,
        `git push`,
      ];
      dependenices.map((dpn) => terminal.sendText(`${dpn}`));
    } catch (error) {}
  };
  const DeployRepo = async (repo_name, environment) => {
    const url = `https://api.github.com/repos/${name}/${repo_name}/deployments`;
    const config = {
      auth: {
        username: context.globalState.get("user_name"),
        password: context.globalState.get("user_token"),
      },
    };

    const data = {
      ref: "main",
      environment: environment,
      description: "Deployment triggered via Node.js script",
      auto_merge: false,
    };

    try {
      const response = await axios.post(url, data, config);
      vscode.window.showInformationMessage("Deployed!");
    } catch (error) {
      vscode.window.showInformationMessage(
        `error to create! ${error.response.data.message}`
      );
    }
  };
  const createThisRepo = async (repo_name, des) => {
    const url = `https://api.github.com/user/repos`;
    const config = {
      auth: {
        username: context.globalState.get("user_name"),
        password: context.globalState.get("user_token"),
      },
    };

    const data = {
      name: repo_name,
      description: des,
      private: false,
    };
    try {
      const response = await axios.post(url, data, config);
      vscode.window.showInformationMessage("created!");
    } catch (error) {
      vscode.window.showInformationMessage(
        `error to create! ${error.response.data.message}`
      );
    }
  };
  const disposable = vscode.commands.registerCommand(
    "extension.start",
    async () => {
      vscode.window.showInformationMessage("Hello World from git-env!");
      try {
        const currentWorkspaceRoot = vscode.workspace.rootPath;
        const repo_name = currentWorkspaceRoot.split("\\").pop();
        const des = "Application";
        if (name && token) {
          createThisRepo(repo_name, des);
        } else {
          update_user();
        }
      } catch (error) {
        vscode.window.showInformationMessage(error);
      }
    }
  );
  const disposables = vscode.commands.registerCommand(
    "extension.keepme",
    async () => {
      try {
        const currentWorkspaceRoot = vscode.workspace.rootPath;
        const repo_name = currentWorkspaceRoot.split("\\").pop();
        if (name && token) {
          AddToRepo(repo_name);
          let saveListener = vscode.workspace.onDidSaveTextDocument(() => {
            vscode.window.showInformationMessage("changes occures");
            ChangesRepo();
          });
        } else {
          update_user();
        }
      } catch (error) {
        vscode.window.showInformationMessage(error);
      }
    }
  );
  const disposabless = vscode.commands.registerCommand(
    "extension.goon",
    async () => {
      try {
        const currentWorkspaceRoot = vscode.workspace.rootPath;
        const repo_name = currentWorkspaceRoot.split("\\").pop();
        if (name && token) {
          (async () => {
            await DeployRepo(repo_name, "production");
          })();
        } else {
          update_user();
        }
      } catch (error) {
        vscode.window.showInformationMessage(error);
      }
    }
  );
  const disposablees = vscode.commands.registerCommand(
    "extension.update",
    async () => {
      try {
          update_user();
      } catch (error) {
        vscode.window.showInformationMessage(error);
      }
    }
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
