"use strict";function requestLanguage(){let availableLanguages=["zh-cn","zh-tw","zh","en-us","en-gb","en","ja-ja","ja"],availableLanguagesNative=["中文（中国）","中文（臺灣）","中文","English (United States)","English (United Kingdom)","English (Global)","日本语（日本）","日本语"],determined=!1,preferred="en",preferredIndex=5;switch(navigator.languages.forEach((e,i)=>{-1!=availableLanguages.indexOf(e.toLowerCase())&&(determined||(preferred=e,preferredIndex=availableLanguages.indexOf(e.toLowerCase()),determined=!0,console.info("Detected language: $1".replace("$1",availableLanguagesNative[preferredIndex]))))}),console.info("Using language: $1".replace("$1",availableLanguagesNative[preferredIndex])),self.lang={threadOnline:"Thread [$1] is activated, $2 operation(s) per second.",methodInvalid:'Method "$1" is invalid',mediaStartedLoading:"Media loading from [$1]",fileLoading:"Loading local file [$1]",formatDetected:"Detected file format as [$1], type as [$2].",unsupportedFileType:"File extension [$1] with type [$2] is not supported.",keyPressed:"Key [$1] is pressed by user.",search:"Enter keywords and search...",noMsgSpec:'No message specification "$1"'},preferredIndex){case 0:lang.threadOnline="已启动[$1]线程，每秒执行$2次",lang.methodInvalid='方法"$1"不可用',lang.search="键入关键词以搜索..."}self.updateLanguageAssets&&updateLanguageAssets()}addEventListener("languagechange",function(){requestLanguage()}),requestLanguage();