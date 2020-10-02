API_ACCESS_TOKEN=$1
VERSION_FILE=$2
CI_PROJECT_URL=$3
CI_PROJECT_ID=$4

VERSION=$(grep "^[^# ]" ${VERSION_FILE})

if [ -z "${VERSION}" ]; then
  echo "No version type given, skipping incrementation"
  exit 1
elif [ "${VERSION}" != "MAJOR" ] && [ "${VERSION}" != "MINOR" ] && [ "${VERSION}" != "HOTFIX" ]; then
  echo "Error: Unknown version type"
  exit 2
fi

GITLAB_URL=$(echo ${CI_PROJECT_URL} | awk -F "/" '{print $1 "//" $2$3}')
VAR=$(curl -s -f --header "PRIVATE-TOKEN: ${API_ACCESS_TOKEN}" "${GITLAB_URL}/api/v4/projects/${CI_PROJECT_ID}/variables/${VERSION}" | jq -r '.value')
VAR=$((VAR+1))
curl -s -f --request PUT --header "PRIVATE-TOKEN: ${API_ACCESS_TOKEN}" "${GITLAB_URL}/api/v4/projects/${CI_PROJECT_ID}/variables/${VERSION}" --form "value=${VAR}"

if [ "${VERSION}" == "MAJOR" ]; then
    curl -s -f --request PUT --header "PRIVATE-TOKEN: ${API_ACCESS_TOKEN}" "${GITLAB_URL}/api/v4/projects/${CI_PROJECT_ID}/variables/MINOR" --form "value=0"
    curl -s -f --request PUT --header "PRIVATE-TOKEN: ${API_ACCESS_TOKEN}" "${GITLAB_URL}/api/v4/projects/${CI_PROJECT_ID}/variables/HOTFIX" --form "value=0"
fi

if [ "${VERSION}" == "MINOR" ]; then
    curl -s -f --request PUT --header "PRIVATE-TOKEN: ${API_ACCESS_TOKEN}" "${GITLAB_URL}/api/v4/projects/${CI_PROJECT_ID}/variables/HOTFIX" --form "value=0"
fi