# Für das Obsidian Plugin Proletarian Task Wizard versuchen die optik zu verbesseren 

ChatGPT gespräch: https://chatgpt.com/c/680fc26b-c288-800f-8543-58a932ca420c

# Vorbereitung

nvm installieren und LTS nutzen

```
nvm install --lts
nvm use --lts
```

repo clonen: 
`git clone https://github.com/cfe84/obsidian-pw.git`

npm dependencies:
`npm install`
`npm run build` -> error! chatgpt sagt ich muss TypeScript updaten
`npm install typescript@latest --save-dev`  -> fixed it!
`npm run build` -> done in 81ms -> main.js

bauen und kopieren nach obsidian:
`npm run build && cp main.js /Users/rob/Documents/Obsidian/.obsidian/plugins/proletarian-wizard-dev`

# Plugin builden und in Obsidian kopieren

`% ./runme.sh`

# Plugin Darstellung verändern

CSS Klasse `.pw-todo-container` sind die einzelnen todos im Backlog