# translate-json -- monkey translate subtitle in json, mostly for RPGMaker.
this program grep subtitle from json,
and you can paste it into google translate or somewhat.
finally feed the translated result back to the program,
and program will generate the new json.
replace the old json with the translated new one,
and enjoy your game.

## install
```sh
npm install --global https://github.com/GHolk/translate-json/archive/refs/tags/v3.0.1.tar.gz
```

this package contain two executable,
`translate-json` and `translate-json-core` .
translate-json is the front-end interface of
translate-json-core.

after installing with correct `npm prefix`,
you can run this two command in shell directly,
or you can execute with npx in a local install:
`npx translate-json` .

## merge multiple json into a single large json
this is optional, if your game have multiple json.
*this script use unix shell.*

```sh
translate-json join *.json > merge.json
```

## find subtitle
grep the subtitle from the json.
default will find subtitle with non-ascii.

```sh
translate-json find merge.json > merge.tsv
# same to
# `translate-json find -m '/[^\u0000-\u00A0]/' merge.json > merge.tsv`
```

to find other kind of subtitle, use regexp.

```sh
translate-json find -m '[\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]' > merge.json
# or use defined short cut in npm script:
# `translate-json find-ja merge.json > merge.tsv`
```

## exclude translation
you can exclude translation of some keyword with `-x` option,
note that keyword need fully equal to the json string value,
but not include.

```sh
translate-json find-ja -x Player1 -x 狂戰士 merge.json > merge.tsv
```

use count script to find repeat string in json,
this require a unix shell with sed, sort and uniq.

```sh
translate-json count < merge.tsv > count.txt
```

## copy to online translation
get line wise subtitle:

```sh
sed 's/^.*\t//' merge.tsv > subtitle.txt
```

copy the content of file to online translation website
like translate.google.com or whatever you like.
and save it to another file if you are not familiar with pipe.

you should make sure that every line in the translated file
match exactly the same line in the original file.

## generate new json
use following command to generate the new subtitle tsv.

```sh
sed 's/\t.*$//' merge.tsv | paste - subtitle-translate.txt > translate.tsv
```

finally patch the json with subtitle tsv,
and generate new json.

```sh
translate-json patch merge.json < translate.tsv > translate.json
```

## split merge json
if you merge json before, you have to split it.

```sh
translate-json split translate.json
```

## final
you can copy the json back to origin directory,
and replace the old json.
for rpg maker, subtitle json should inside `www/data` directory.

for low level operation, use `translate-json-core --help`
to see the options.
