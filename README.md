# Student Performance Analytics

## 1. Project Information

| Item | Details |
| --- | --- |
| Course | SEN0415 Advanced Web Programming |
| University | Istanbul Kültür University |
| Project | Student Performance Analytics |
| Group members | Huriye Kayadelen — 2200005795 and Tuba Nazlı İpekyüz — 2200004323 |

**Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz**

[Group repository on GitHub](https://github.com/naz051223/sen0415-student-performance)

## 2. Project Purpose

An instructor needs to see how a class is doing, who is below a passing mark, and how weekly averages are changing. The dashboard brings those views together. Instructors can review the score distribution, identify grade groups that may warrant a closer look, and compare the effects of different passing marks.

Grafana provides dashboards, query controls, a common data frame format, and live charts. The project uses its plugin system to add course-specific analysis while retaining Grafana’s data source and dashboard tools. The included grades and live signals are fictional.

## 3. Project Architecture

| Grafana plugin | ID | Responsibility |
| --- | --- | --- |
| **Student Performance** panel | `kultur-studentperformance-panel` | Reads named student scores, calculates class statistics, renders the results table, groups grades with K-means, and simulates a different passing mark. |
| **Student Performance Trend** panel | `kultur-studenttrend-panel` | Aggregates scores by week, compares forecasting methods on historical weeks, and displays the next weekly average estimate. |
| **Student Score Data** source | `kultur-studentscore-datasource` | Reads the bundled weekly JSON file and returns the requested week range as Grafana DataFrames. |

The dashboard routes three independent queries.

| Input | Data flow | Dashboard output |
| --- | --- | --- |
| Sample CSV | Grafana TestData parses the CSV Content query into a DataFrame containing `score` and optional `student` fields. | **Sınıf sonuçları**, the Student Performance panel. |
| Bundled JSON | Student Score Data reads `scores.json`, filters the requested weeks, and produces numeric `week` and `score` fields. The Trend panel averages scores within each week. | **Haftalık ortalama tahmini**, the Student Performance Trend panel. |
| Simulated Live measurements | The built-in Grafana data source subscribes to a TestData stream and delivers timestamped measurements to a time-series panel. | **Canlı sinyal (simülasyon)**, the built-in Live chart. |

Grafana passes the query results to the panels as DataFrames. The custom panels calculate their displays in the browser. The dashboard JSON and provisioning files link the panels to their sources.

## 4. Main Panel Features

| Feature | What it does and why it helps |
| --- | --- |
| Student grade visualization | Shows each student’s name, numeric grade, and pass/fail status. On wider panels, a score meter gives a quick visual comparison. |
| Average grade | Shows the arithmetic mean of all valid grades as a class-level summary. |
| Pass/fail calculations | A grade at or above the passing mark counts as a pass. The pass rate divides passing records by all valid records so an instructor can see how much of the class met the requirement. |
| Passing-grade configuration | The `Geçme barajı` panel option sets the official mark for the displayed results. The demo uses 60 on a 0–100 scale. |
| Filtering and sorting | The result selector shows all students, only passes, or only scores below the mark. Rows are sorted by descending score, with name as the tie-breaker. The filter applies to the table, while the summary and analysis retain the full class. |
| Median | Shows the middle grade, or the mean of the two middle grades for an even count. This gives a measure of the class center that is less sensitive to extreme scores. |
| Population standard deviation | Measures how spread out the displayed class dataset is around its mean. Higher values indicate a wider spread on the same grading scale. |
| Grade distribution | Counts scores in four bands, 0–<50, 50–<70, 70–<85, and 85–100. The counts show where most grades fall. |
| Top and bottom students | Uses the existing score ranking to show up to three students at each end of the class results. |
| Responsive design | Metric and analysis cards wrap at narrower widths. The table drops inline meters when space is limited and keeps names, values, and statuses readable. |

The simulator slider has an accessible name and responds to keyboard input. The **End** key moves the slider to 100. **Reset Simulation** returns it to the official passing mark. At a 390 px viewport, the layout wrapped without horizontal overflow in the panel, and the simulator remained operable.

The panel accepts finite numeric grades between 0 and 100, including both endpoints. It reports excluded invalid scores, uses a fallback label for a missing student name, and shows a message for an empty or failed query.

## 5. AI and Machine Learning

### K-means clustering

K-means groups students by similarity of their current grades. The algorithm starts with up to three centers based on distinct grade values. It assigns each student to the nearest center and recalculates each center as the mean grade of its assigned students. The group cards show lower, middle, and higher clusters from left to right, with each cluster’s average, count, and member names. A dataset with one or two distinct grades uses fewer groups.

The average explains why a group appears at a particular level, and the members let the instructor see which grades contribute to it. The groups describe the current dataset. They can change when the input grades change, use grade alone, and cannot predict a student’s future performance or explain the causes of a grade.

### Linear regression and historical error

The Trend panel calculates a class mean for each observed week. Linear regression fits a straight line to those weekly means, using week number as the input. The panel evaluates the fitted line at the next week and limits the estimate to the 0–100 grade scale.

Starting with the fourth observed week, the panel performs historical checks using the earlier weeks to predict the next observed result. It compares regression with a baseline that repeats the most recent weekly mean. It reports mean absolute error for both methods and uses the method with lower historical error for the displayed forecast. A tie uses the baseline.

The demo queries weeks 1–8 and estimates the week 9 average at **83.75/100** using regression. The historical mean absolute errors are **0.97** points for regression and **2.6** for the baseline. The panel needs at least four distinct weeks. The estimate applies to the class average, and changes in class composition, grading, or recent trends may reduce its accuracy.

## 6. What-If Simulator

Move the passing-grade slider to see how the class pass rate would change at a different mark. The simulator shows the rate under the configured mark, the rate under the simulated mark, and the difference in **percentage points**. For example, moving from 75% to 25% represents a change of −50 percentage points.

**Reset Simulation** returns the slider to the configured passing mark. The simulation value lives in the panel’s local interface state. It is cleared by reset or reload and leaves the dashboard configuration and official table statuses intact.

## 7. Data Source Plugin

**Student Score Data** reads the bundled `score-data/scores.json` through Grafana. Each record contains a positive integer week and a finite grade from 0 to 100. The record list becomes a DataFrame with numeric `week` and `score` fields, tagged with the query reference ID.

- **First week** (`fromWeek`) and **Last week** (`toWeek`) are inclusive. A blank first week starts at 1. A blank last week includes all later weeks.
- In the Grafana query editor, leave the input field after editing so the query reruns. The demo starts with weeks 1–8.
- **Save & test** checks whether the bundled file can be read. The source reports missing or invalid data and rejects invalid week ranges with an error message.
- **CSV support** is provided by Grafana TestData’s **CSV Content** query for the main panel. `demo/students.csv` contains the corresponding sample. The custom Student Score Data plugin reads JSON.

## 8. Grafana Live / WebSocket

The Live chart subscribes to the TestData channel `plugin/testdata/random-2s-stream` via Grafana Live. The chart shows new timestamped measurements approximately every two seconds. The stream demonstrates live delivery using synthetic signals. The weekly prediction uses the separate JSON grade data.

## 9. Installation and Running

### Build the plugins

1. Install Node.js 24 with npm. Open a terminal at the project root after extracting the submission or opening the repository.
2. Run the following commands to install the locked dependencies and build all three plugins.

```sh
npm ci
npm run build
```

| Build directory | Plugin ID |
| --- | --- |
| `dist/` | `kultur-studentperformance-panel` |
| `dist-trend/` | `kultur-studenttrend-panel` |
| `dist-score-data/` | `kultur-studentscore-datasource` |

### Windows with standalone Grafana

1. Extract the Grafana OSS 13.3.1 standalone Windows binaries. Use the directory that contains `bin` as `-GrafanaHome`. [Grafana OSS 13.3.1 download](https://grafana.com/grafana/download/13.3.1?edition=oss&platform=windows)
2. From the project root, run the included PowerShell launcher. Replace the example home path with your extracted location.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start-grafana.ps1 -GrafanaHome 'C:\grafana-13.3.1'
```

3. Open the local dashboard. The script provisions both data sources and the dashboard. Local Grafana data is written under `.grafana-local/` by default. [Windows dashboard](http://127.0.0.1:3100/d/student-performance/student-performance)

### Docker Compose and WSL

Start Docker Desktop or another Docker Engine with the Compose plugin. On Windows with WSL 2, enable Docker Desktop’s integration for your distro if running the Compose commands from its shell. Open the same project directory from the distro, usually under `/mnt/c/`, and use the already-built outputs or build them in the same environment. [Docker Desktop WSL integration](https://docs.docker.com/desktop/features/wsl/)

```sh
docker compose config --quiet
docker compose up -d
```

The Compose configuration mounts the three build directories and provisions the dashboard. The configuration was validated. The recorded runtime verification used standalone Windows Grafana. [Docker dashboard](http://localhost:3000/d/student-performance/student-performance)

### Manual plugin installation and dashboard import

1. Copy the contents of each build directory into the Grafana plugin directory in a subfolder named with its plugin ID.
2. On your local development instance, add all three IDs to the comma-separated `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS` setting and restart Grafana.
3. Provision the data sources from `demo/provisioning/datasources/testdata.yaml`. The dashboard references the UIDs `student-performance-demo` and `student-score-data`.
4. In Grafana, choose **Dashboards → New → Import** and upload `demo/student-performance.json`. Use a clean instance or a different dashboard UID if the provisioned dashboard already uses `student-performance`. [Grafana dashboard import](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/import-dashboards/)

## 10. Testing

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

| Check | Result |
| --- | --- |
| TypeScript | **PASS** for the TypeScript main panel and the checked JavaScript plugins. |
| ESLint | **PASS** for the source and tests. |
| Jest | **PASS** with 12 tests across 3 suites. `npm test` builds first so the main panel tests can load the compiled plugin. |
| Production build | **PASS** for all three output directories. |
| Integration | **PASS** for Grafana 13.3.1 plugin discovery, dashboard provisioning and import, CSV and JSON queries, week filtering, visible panel credits, clustering, simulation, Trend, and live WebSocket measurements. |

The Jest suites cover grade validation and filtering, summary calculations, clustering edge cases, simulator reset, narrow-panel rendering, Trend prediction and fallback, and data-source queries and errors.

## 11. Bonus Features

| Instructor category | Status | Evidence or scope |
| --- | --- | --- |
| Data source usage | Implemented | Grafana TestData serves the class CSV query. Student Score Data serves weekly JSON grades. |
| Data source operations | Implemented | Week-range arguments, DataFrame conversion, connection testing, and data validation. |
| Custom data source plugin | Implemented | Student Score Data is registered as its own Grafana data-source plugin. |
| Panel operations | Implemented | Score bars, class statistics, table filtering and ordering, configurable threshold, and what-if analysis. |
| Additional panel | Implemented | Student Performance Trend shows weekly predictions and historical errors. |
| AI | Implemented | Grade similarity via K-means and class mean forecasts via linear regression, with visible summaries for both methods. |
| GitHub | Implemented | The group repository and Git commit history record the source, integration and final submission updates. |
| Documentation | Implemented | English README, setup and verification steps, CATS instructions, and task distribution. |
| Good code | Implemented | Typed analysis functions, Grafana plugin boundaries, lint and type checks, and targeted tests. |
| WebSocket | Implemented | The Live chart received multiple timestamped TestData publications through Grafana Live. |
| YouTube demo | Not verified | The verified MP4 is included in the submission. |
| Tests | Implemented | 12 passing tests across the three plugins and separate browser integration checks. |
| UI/UX | Implemented | Responsive statistics, results ordered by score, a keyboard-operable slider, and a provisioned demo dashboard. |
| Very Big Bonus | Supporting evidence | The following section addresses the four review criteria. The instructor determines eligibility and scoring. |

### Very Big Bonus — Supporting Evidence

| Review criterion | Evidence in this project |
| --- | --- |
| Overall project quality | The three Grafana plugins turn separate grade queries into a class overview, a weekly forecast, and a configurable data source. An instructor can review below-threshold rows, inspect grade groups, and compare passing marks before changing the official threshold. |
| Originality of the AI features | The contribution is how established methods are combined in the same teaching workflow. K-means describes current grade similarity and explains each group through its average, size, and members. The Trend panel answers a separate question about a future weekly class average. |
| Research value of the AI methodology | The historical comparison uses an expanding window. Starting with three observed weeks, both methods predict the next observed week using only earlier data. Mean absolute error lets the instructor compare regression with the last-observation baseline in grade points. In the demo, the five checks give 0.97 points for regression and 2.6 for the baseline. |
| Development approach and code quality | The main panel separates pure analysis functions from the UI. The week-filtered JSON source returns Grafana DataFrames, and the Trend plugin handles forecasting independently from the Live stream. The locked build, 12 Jest tests, and recorded Grafana checks make the results reproducible. |

The demo uses fictional records and eight observed weeks. The K-means centers summarize one variable, the grade. They can shift as the class dataset changes and cannot explain why a student scored at a particular level. The weekly fit assumes a linear trend and the five historical checks are too few to establish generalization. A longer history, a separate evaluation period, and uncertainty intervals would strengthen the evidence. The instructor determines whether the project qualifies for the bonus.

## 12. Group Members and Task Distribution

### Huriye Kayadelen — 2200005795

Huriye developed the **Student Performance** panel plugin. Her assigned work included student grade visualization and calculations, passing-grade settings, filtering and sorting, and the responsive main-panel layout. The panel includes median and population standard deviation, grade distribution, top and bottom rankings, explainable K-means clustering, and the What-If Simulator.

### Tuba Nazlı İpekyüz — 2200004323

Tuba Nazlı developed the **Student Score Data** source plugin and the **Student Performance Trend** panel plugin. Her assigned work included the JSON source and CSV dashboard integration, week filtering and source operations, weekly linear regression, historical prediction-error comparison, Grafana Live integration, automated testing, and demo preparation.

Both students’ names appear in the main and Trend panel interfaces and in [CATS_SUBMISSION.md](CATS_SUBMISSION.md).

## 13. Screenshots and Demo

| Screenshot | What it shows |
| --- | --- |
| [01-main-panel.png](demo/evidence/screenshots/01-main-panel.png) | The final dashboard with the main panel and both developer names. |
| [02-student-statistics.png](demo/evidence/screenshots/02-student-statistics.png) | Class summary and the results table filtered to passing grades, sorted by score. |
| [03-kmeans-clustering.png](demo/evidence/screenshots/03-kmeans-clustering.png) | Data-driven groups, counts, averages, members, and the explanation shown in Grafana. |
| [04-what-if-simulator.png](demo/evidence/screenshots/04-what-if-simulator.png) | A changed simulation cutoff, the current and simulated rates, and their percentage-point difference. |
| [05-trend-prediction.png](demo/evidence/screenshots/05-trend-prediction.png) | Week 9 prediction, regression and baseline errors, and both developer names. |
| [06-data-source.png](demo/evidence/screenshots/06-data-source.png) | The configured Student Score Data source and a successful connection test. |
| [07-live-data.png](demo/evidence/screenshots/07-live-data.png) | New timestamped points in the Grafana Live chart. |
| [08-tests-and-build.png](demo/evidence/screenshots/08-tests-and-build.png) | Terminal output from the successful typecheck, ESLint, Jest, and production build commands. |

The 1 minute 58 second H.264 MP4 records the running Grafana dashboard, including the results filter, threshold option, clustering, simulator, weekly prediction, custom data source, and Live chart. It uses on-screen captions. [SEN0415_Huriye_Nazli_Final_Demo.mp4](demo/evidence/SEN0415_Huriye_Nazli_Final_Demo.mp4)

## 14. Limitations and Future Improvements

The demo uses a small, fictional dataset. TestData CSV is suitable for demonstrating the panel, and the custom JSON source is bundled and read-only. An institutional rollout would need an authenticated data source and appropriate protections for student records.

K-means uses a single numeric grade and describes the supplied records. The weekly estimate is based on a short history of class averages. Future work could add larger historical samples, uncertainty ranges, multi-assessment filters, and a comparison against forecasts on a separate evaluation dataset.

The archive contains the three plugin sources and builds, dashboard JSON, tests, task distribution, screenshots, and the final demo. [CATS submission notes](CATS_SUBMISSION.md)
