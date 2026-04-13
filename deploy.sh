#!/bin/bash
 #npm run build
 gcloud auth login  admin@althenia.fr
 gcloud config set project alth-patient
 gcloud app deploy ./app.yaml -v 1
