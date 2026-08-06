# Seed RAG (plain words)

## Built-in TRV facts

```bash
bash $HOME/The-Remote-Viewer/modules/rag/seed-trv-docs.sh
```

## Your own words

```bash
mkdir -p $HOME/.local/share/remote-viewer/rag/docs

# one shot
echo 'Medicine goal six PM local. Prefer short answers.' >> $HOME/.local/share/remote-viewer/rag/docs/personal.txt

# or from chat at you>
# /note Medicine goal six PM local. Prefer short answers.

bash $HOME/The-Remote-Viewer/modules/rag/ingest.sh
```

Use normal sentences. Avoid needing `---` or code fences in the notes.

## Check

```bash
bash $HOME/The-Remote-Viewer/scripts/chat.sh
# at you>
# what can you do
```
