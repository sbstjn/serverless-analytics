#!/usr/bin/env bash

case "$1" in
  # Deploy service with serverless to AWS
  service)
    $(npm bin)/serverless deploy
    ;;
  # Deploy content from `dist` folder to S3 bucket
  website|dashboard)
    # Check for configuration
    if [ ! -f .serverless/output.json ]; then
      echo "Error: No CloudFormation stack output found!"
      echo ""
      echo "Please run ./scripts/deploy.sh service"
      exit 1
    fi

    # Run build tasks
    echo "Compile static resources …"
    echo ""
    
    ./scripts/build.sh 

    BucketNameWebsite=`cat .serverless/output.json | jq -r '.BucketNameWebsite'`
    BucketNameDashboard=`cat .serverless/output.json | jq -r '.BucketNameDashboard'`
    Region=`cat .serverless/output.json | jq -r '.Region'`

    WebsiteURL="http://$BucketNameWebsite.s3-website-$Region.amazonaws.com/"
    DashboardURL="http://$BucketNameDashboard.s3-website-$Region.amazonaws.com/"

    echo ""
    echo "Sync \`dist\` folder with S3 …"
    echo ""

    # Sync with S3 bucket
    $(npm bin)/s3sync -b $BucketNameWebsite -p dist/website

    # Sync with S3 bucket
    $(npm bin)/s3sync -b $BucketNameDashboard -p dist/dashboard

    echo ""
    echo "Dashboard: $DashboardURL"
    echo "Website: $WebsiteURL"
    ;;
  # Run `service` and `website` sub tasks per default
  *)
    $0 service
    $0 website
    ;;
esac
