#!/bin/bash

for lang in ar de es fa fr hi hr it pt sq sr ta tr
do
    echo $lang
    python translate.py ../app/i18n/en.json ../app/i18n/$lang.json -s en -t $lang
done