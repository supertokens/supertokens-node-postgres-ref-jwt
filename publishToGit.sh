(cd website && GIT_USER=rishabhpoddar \
CURRENT_BRANCH=website \
USE_SSH=true \
CUSTOM_COMMIT_MESSAGE="[skip ci]" \
npm run publish-gh-pages)