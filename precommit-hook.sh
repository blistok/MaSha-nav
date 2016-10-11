#!/bin/bash
cd $(git rev-parse --show-toplevel)

dt=`date -u +%d.%m.%Y-%H:%M:%S`
if [ "$(git status --porcelain src/js/masha.js | cut -b1)" == "M" ]; then 
    # packing js
    echo "packing masha.js..."
    curl -s --data-urlencode js_code@"masha_nav.js" --data-urlencode \
        compilation_level="SIMPLE_OPTIMIZATIONS" --data-urlencode \
        output_format="text" --data-urlencode output_info="compiled_code" \
        http://closure-compiler.appspot.com/compile > masha_nav.min.js
    git add masha_nav.min.js
fi
