// English sight word bank — 15 groups covering K-3 high-frequency words
// Groups 1-5: Original word bank
// Groups 6-10: K-1 expansion (nouns, verbs, adjectives, prepositions, colors/numbers)
// Groups 11-15: 2nd-3rd grade sight words

export const WORD_GROUPS = {
  "Group 1 – Most Common": [
    "the","and","is","it","in","to","he","she","was","we","my","do","no","go","so",
    "a","I","at","am","up","if","on","as","be","by","an","or","of","me","us"
  ],
  "Group 2 – Action Words": [
    "said","have","like","come","make","see","look","play","run","jump","help","want","give","take","put",
    "ask","tell","get","let","find","walk","talk","read","sing","draw","work","try","use","show","keep"
  ],
  "Group 3 – Connectors": [
    "what","where","when","who","why","how","that","this","with","from","they","them","her","his","but",
    "all","our","out","not","one","had","for","you","are","can","did","its","off","too","two"
  ],
  "Group 4 – Describing Words": [
    "big","little","good","new","old","first","long","very","over","after","before","under","just","again","around",
    "fast","slow","hot","cold","pretty","funny","happy","sad","nice","well","better","best","more","most","own"
  ],
  "Group 5 – Tricky Words": [
    "could","would","should","because","know","write","right","their","there","were",
    "some","done","does","goes","every","once","upon","always","never","often",
    "even","also","only","other","another","many","much","through","though","while"
  ],
  "Group 6 – People & Animals": [
    "man","woman","boy","girl","baby","friend","teacher","mom","dad","mother","father",
    "brother","sister","family","people","child","children","dog","cat","bird","fish",
    "horse","chicken","duck","rabbit","mouse","frog","bear","lion","monkey","elephant"
  ],
  "Group 7 – Things & Places": [
    "house","home","school","car","tree","water","food","book","door","room","table",
    "chair","bed","window","floor","wall","street","park","farm","city","store",
    "road","river","lake","hill","ground","sky","sun","moon","star","rain"
  ],
  "Group 8 – More Actions": [
    "think","open","close","start","stop","move","turn","pick","pull","push",
    "cut","eat","drink","sleep","wake","sit","stand","fly","swim","climb",
    "throw","catch","hold","carry","follow","listen","watch","clean","wash","paint"
  ],
  "Group 9 – Time & Order": [
    "day","night","morning","today","tomorrow","yesterday","week","year","now","then",
    "soon","later","next","last","end","begin","still","already","yet","during",
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday","month","season","spring"
  ],
  "Group 10 – Colors & Numbers": [
    "red","blue","green","yellow","orange","purple","pink","black","white","brown",
    "gray","three","four","five","six","seven","eight","nine","ten","zero",
    "hundred","thousand","color","number","half","pair","both","few","several","enough"
  ],
  "Group 11 – 2nd Grade Sight Words": [
    "been","buy","call","don't","found","gave","made","these","those","wish",
    "world","your","above","across","along","any","behind","came","down","going",
    "got","shall","small","warm","fall","far","full","grow","hurt","kind"
  ],
  "Group 12 – 2nd Grade Continued": [
    "about","light","myself","which","away","between","brought","certain","cover","deep",
    "else","group","idea","large","learn","leave","left","letter","life","line",
    "mean","might","near","page","pattern","point","power","press","real","record"
  ],
  "Group 13 – 3rd Grade Sight Words": [
    "bring","laugh","answer","become","believe","body","break","build","change","class",
    "complete","dark","direct","exercise","face","fact","force","forget","free","gone",
    "happen","head","heard","high","include","joy","known","mark","mile","note"
  ],
  "Group 14 – 3rd Grade Continued": [
    "community","country","earth","field","flower","forest","garden","mountain","ocean","planet",
    "space","animal","island","market","village","together","add","afraid","alive","alone",
    "ate","became","below","beside","beyond","circle","clear","correct","decide","calm"
  ],
  "Group 15 – Challenge Words": [
    "although","different","example","favorite","important","interest","knowledge","minute",
    "necessary","question","really","receive","sentence","special","surprise","thought",
    "trouble","usually","welcome","whole","wonderful","able","among","cause","consider",
    "continue","describe","develop","age","agree"
  ],
};

export const ALL_WORDS = Object.values(WORD_GROUPS).flat();
export const GROUP_NAMES = Object.keys(WORD_GROUPS);
