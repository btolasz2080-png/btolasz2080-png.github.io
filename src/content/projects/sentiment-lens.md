---
title: Sentiment Lens
summary: A bilingual machine-learning model and dashboard that reads product reviews and explains why they feel positive or negative.
year: 2025
role: ML engineer & full-stack developer
category: AI
tech: [Python, scikit-learn, Pandas, FastAPI, React]
featured: true
order: 2
accent: blue
sample: true
---

## The problem
Small online shops receive hundreds of reviews but have no time to read them. They need the *why*, not just a star rating.

## The process
I cleaned and labelled a review dataset, compared several classical models, and served the best one through a FastAPI endpoint. A React dashboard highlights the words that pushed each prediction.

- TF-IDF features with a calibrated logistic-regression model
- Explainability: top contributing words for each review
- REST API with automatic documentation

## The result
The model reached strong accuracy on held-out data and, more importantly, produced explanations shop owners understood immediately.
