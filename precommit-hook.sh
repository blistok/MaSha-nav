#!/bin/bash
cd $(git rev-parse --show-toplevel)

if [ "$(git status --porcelain masha_nav.js | cut -b1)" == "M" ]; then 
    # packing js
    echo "packing masha_nav.js..."
    curl -s --data-urlencode js_code@"masha_nav.js" --data-urlencode \
        compilation_level="SIMPLE_OPTIMIZATIONS" --data-urlencode \
        output_format="text" --data-urlencode output_info="compiled_code" \
        http://closure-compiler.appspot.com/compile > masha_nav.min.js
    git add masha_nav.min.js
fi
