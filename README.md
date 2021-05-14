# translate json
monkey translate subtitle in json, mostly for RPGMaker.
this program grep subtitle from json,
and you can paste it into google translate or somewhat.
finally feed the translated result back to the program,
and program will generate the new json.
replace the old json with the translated new one,
and enjoy your game.

## merge multiple json into a single large json
this is optional, if your game have multiple json.
*this script use unix shell.*

```sh
npm run --silent join *.json > merge.json
```

## find subtitle
grep the subtitle from the json.
default will find subtitle with non-ascii.

```sh
npm run --silent find -- merge.json > merge.tsv
# same to
# `npm run --silent find -- -m '/[^\u0000-\u00A0]/' merge.json > merge.tsv`
```

to find other kind of subtitle, use regexp.

```sh
npm run --silent find -- -m  '[\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]' \
    > merge.json
# or use defined short cut in npm script:
# `npm run --silent find-ja -- merge.json > merge.tsv`
```

## exclude translation
you can exclude translation of some keyword with `-x` option,
note that keyword need fully equal to the json string value,
but not include.

```sh
npm run --silent find-ja -- -x Player1 -x 狂戰士 merge.json > merge.tsv
```

use count script to find repeat string in json,
this require a unix shell with sed, sort and uniq.

```sh
npm run count < merge.tsv > count.txt
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
npm run patch --silent merge.json < translate.tsv > translate.json
```

## split merge json
if you merge json before, you have to split it.

```sh
npm run split translate.json
```

## final
you can copy the json back to origin directory.
for rpg maker, subtitle json should inside k
