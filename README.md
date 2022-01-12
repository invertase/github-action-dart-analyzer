<p align="center">
  <h1>⚒️ GitHub Action for Dart Analyzer</h1>
  <span>A GitHub action to run Dart analyzer with annotation support.</span>
</p>

<a href="https://github.com/invertase/github-action-dart-analyzer/blob/main/LICENSE">License</a>

---

## Usage

```yaml
name: "analyze"
on: # rebuild any PRs and main branch changes
  pull_request:
  push:
    branches:
      - main

jobs:
  dart: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: dart-lang/setup-dart@v1
      - uses: invertase/github-action-dart-analyzer@v1
        with:
          # (Optional) Treat info level issues as fatal.
          fatal-infos: false

          # (Optional) Treat warning level issues as fatal
          # (defaults to true).
          fatal-warnings: false

          # (Optional) Whether to add annotations to GitHub actions summary / PR
          # review files.
          # (defaults to true).
          annotate: true

          # (Optional) If set to true only annotations will be created and the
          # GitHub action itself will not fail on Dart analyzer problems. 
          # (defaults to false).
          annotate-only: false

          # (Optional) The working directory to run the Dart analyzer in 
          # (defaults to `./`).
          working-directory: ./
```


## Screenshots

**Example annotation output in PR changes review**:

1) ![image](https://user-images.githubusercontent.com/5347038/149161220-dbd92743-2cdc-4083-b7f2-31ed9ca7f855.png)
2) ![image](https://user-images.githubusercontent.com/5347038/149161397-d6a72437-a15f-4dbb-a6b5-227bd11da210.png)
3) ![image](https://user-images.githubusercontent.com/5347038/149161493-66e2b7f6-177a-4daa-bb66-9d0a26ba391d.png)

**Example annotation output in check summary**:

![image](https://user-images.githubusercontent.com/5347038/149163192-e7f97894-cd1c-4892-92be-580f121a9aef.png)


**Example workflow logs output**:

![image](https://user-images.githubusercontent.com/5347038/149162346-573bf836-489f-458f-8501-60148d2104cd.png)


---

<p align="center">
  <a href="https://invertase.io/?utm_source=readme&utm_medium=footer&utm_campaign=github-action-dart-analyzer">
    <img width="75px" src="https://static.invertase.io/assets/invertase/invertase-rounded-avatar.png">
  </a>
  <p align="center">
    Built and maintained by <a href="https://invertase.io/?utm_source=readme&utm_medium=footer&utm_campaign=github-action-dart-analyzer">Invertase</a>.
  </p>
</p>
