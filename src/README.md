# Student Performance Monitoring Panel

**Course:** SEN0415 Advanced Web Programming  
**University:** Istanbul Kültür University  
**Developer:** Huriye Kayadelen  
**Project Type:** Grafana Panel Plugin

## Project Description

This project is a custom Grafana panel developed using React and TypeScript. It helps teachers analyze student grades and understand overall class performance.

The plugin uses data from Grafana queries and displays interactive charts, statistics, and machine learning insights.

## Main Features

- Student grades and performance visualization
- Average grade and passing rate calculation
- Adjustable passing grade
- Passed, failed, and all-students filters
- Customizable chart colors
- Median and standard deviation
- Grade distribution charts
- Top and bottom student rankings
- Responsive dashboard design
- Interactive What-If Simulator

## AI Feature

The project uses K-means clustering, an unsupervised machine learning algorithm, to group students with similar grades.

The panel displays group averages, student counts, and explanations of the clustering results.

The model analyzes current grades. It does not predict future academic performance.

## Technologies

- React
- TypeScript
- Grafana
- Docker
- Ubuntu WSL 2
- Node.js and npm
- Jest
- Git

## Installation

Requirements: Node.js 24.5 or newer, npm, Docker with Compose, and Git.

Open a terminal inside the plugin project folder.

Install dependencies:

```bash
npm install
```

Start the development build:

```bash
npm run dev
```

In another terminal, start Grafana:

```bash
docker compose up
```

Open Grafana at http://localhost:3000 and select the Student-Performance visualization.

Configure a Grafana query that returns student names and numeric grades between 0 and 100. TestData DB with CSV Content can be used for demonstration.

## Testing

Run:

```bash
npm run typecheck
npm run test:ci
npm run build
```

The project includes automated tests for grade calculations, statistics, simulation, and K-means clustering.

## Bonus Features

The project implements several optional assignment features:

- Grafana data source usage
- Interactive panel configuration
- Statistical analysis
- Responsive design
- K-means machine learning
- What-If simulation
- Automated tests
- Documentation

## Limitations

The demonstration uses synthetic student data. The clustering algorithm considers grades only and must not be used as a definitive evaluation of students' ability or future performance.

## Developer

**Developed by Huriye Kayadelen**