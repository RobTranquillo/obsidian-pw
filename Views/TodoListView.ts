import { TodoItem, TodoStatus } from "../domain/TodoItem";
import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { IDictionary } from "../domain/IDictionary";
import { DateTime } from "luxon";
import { ILogger } from "ILogger";

export interface TodoListViewDeps {
  logger: ILogger
}

export class TodoListView extends ItemView {
  static viewType: string = "pw.todo-list";
  private todos: TodoItem<TFile>[] = []
  constructor(leaf: WorkspaceLeaf, private openFile: (file: TFile, line: number) => Promise<void>, private deps: TodoListViewDeps) {
    super(leaf);
  }

  getViewType(): string {
    return TodoListView.viewType;
  }

  getDisplayText(): string {
    return 'Todo';
  }

  getIcon(): string {
    return 'check-small';
  }

  onClose(): Promise<void> {
    return Promise.resolve();
  }

  onTodosChanged(todos: TodoItem<TFile>[]) {
    this.todos = todos.filter(todo => todo.status !== TodoStatus.Complete && todo.status !== TodoStatus.Canceled);
    this.render()
  }

  private getSelectedTodos(): TodoItem<TFile>[] {
    return this.todos.filter(todo => !!todo.attributes["selected"])
  }

  private getDueTodos(): TodoItem<TFile>[] {
    const dueDateAttributes = ["due", "duedate", "when", "expire", "expires"];
    const now = DateTime.now();
    const todosWithOverdueDate = this.todos.filter(
      (todo) =>
        todo.attributes &&
        dueDateAttributes.find((attribute) => {
          if (
            todo.status === TodoStatus.Complete ||
            todo.status === TodoStatus.Canceled ||
            !todo.attributes ||
            !todo.attributes[attribute]
          )
            return false;
          try {
            const date = DateTime.fromISO(`${todo.attributes[attribute]}`);
            return date < now;
          } catch (err) {
            this.deps.logger.error(`Error while parsing date: ${err}`);
            return false;
          }
        })
    );
    return todosWithOverdueDate
  }

  private statusToIcon = (status: TodoStatus): string => {
    switch (status) {
      case TodoStatus.Complete:
        return "✔";
      case TodoStatus.AttentionRequired:
        return "❗";
      case TodoStatus.Canceled:
        return "❌";
      case TodoStatus.Delegated:
        return "👬";
      case TodoStatus.InProgress:
        return "‍⏩";
      case TodoStatus.Todo:
        return "⬜";
      default:
        return "";
    }
  };

  private priorityToIcon(
    attributes: IDictionary<string | boolean> | undefined
  ) {
    const attributeIsPriority = (attributeName: string) =>
      attributeName === "priority" || attributeName === "importance";
    return attributes
      ? (Object.keys(attributes)
        .filter(attributeIsPriority)
        .map((priority) => attributes[priority])
        .map((attributeValue) =>
          attributeValue === "critical"
            ? "❗❗"
            : attributeValue === "high"
              ? "❗"
              : attributeValue === "medium"
                ? "🔸"
                : attributeValue === "low"
                  ? "🔽"
                  : attributeValue === "lowest"
                    ? "⏬"
                    : ""
        )[0] as string) || ""
      : "";
  }

  public render(): void {
    const container = this.containerEl.children[1];
    container.empty();
    container.createDiv('pw-container', (el) => {
      el.createEl("b", { text: "Selected:" })
      this.renderTodos(this.getSelectedTodos(), el);
      el.createEl("b", { text: "Due:" })
      this.renderTodos(this.getDueTodos(), el);
      el.createEl("b", { text: "All:" })
      this.renderTodos(this.todos, el);
    });
  }

  private renderTodos(todos: TodoItem<TFile>[], el: HTMLElement) {
    const foldedText = ` ▶`
    const unfoldedText = " ▼"
    el.createDiv(undefined, (el) => {
      todos.forEach(todo => {
        el.createDiv("div", (container) => {
          container.createEl("span", {
            text: `${this.statusToIcon(todo.status)} `,
            cls: "todo-checkbox"
          })
          const textElement = container.createEl("span", {
            text: `${this.priorityToIcon(todo.attributes)} ${todo.text}`,
            cls: "todo-text"
          })
          const subDisplay = container.createEl("span", {
            text: todo.subtasks && todo.subtasks.length ? foldedText : "  ",
            cls: "todo-sub"
          })
          const subElementsContainer = container.createEl("div", "todo-sub-container")
          textElement.onclick = () => this.openFile(todo.file.file, todo.line || 0);
          let subTasksUnfolded = false
          subDisplay.onclick = () => {
            if (subTasksUnfolded) {
              subDisplay.innerText = foldedText
              subElementsContainer.childNodes.forEach(child => subElementsContainer.removeChild(child))
            } else {
              subDisplay.innerText = unfoldedText
              this.renderTodos(todo.subtasks, subElementsContainer);
            }
            subTasksUnfolded = !subTasksUnfolded
          }
        })
      })
    })
  }
}