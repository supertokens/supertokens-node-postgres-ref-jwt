# SAMPLE USAGE: bash createVersion.sh 4.0.X
version=$1
if [[ $version == "" ]]; then
echo "Version cannot be empty"
echo "Sample Usage: bash createVersion.sh 4.0.X"
exit 1
fi
echo "******* Creating version using docusaurus *******"
cd website
npm run version $version
cd ..
echo "******* Updating latest version *******"
sed -i '' -e 's/.*THIS COMMENT IS USED TO REPLACE THE LATEST VERSION.*/ let latestVersion = "'$version'"; \/\*THIS COMMENT IS USED TO REPLACE THE LATEST VERSION\*\//g' ./website/static/scripts/utils.js