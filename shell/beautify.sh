## All paths to beautify
declare -a files=("./dev/**/**/**.js" "./dev/**/**/_tests/*.js" "./dev/**/*.js" "./dev/**/_tests/*.js")

for i in "${files[@]}"
do
   ./node_modules/.bin/js-beautify $i --replace --config beautify.json
done
