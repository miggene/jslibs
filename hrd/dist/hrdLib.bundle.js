!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.HrdLib=e():t.HrdLib=e()}(self,(function(){return(()=>{"use strict";var t={492:function(t,e,r){var o=this&&this.__createBinding||(Object.create?function(t,e,r,o){void 0===o&&(o=r),Object.defineProperty(t,o,{enumerable:!0,get:function(){return e[r]}})}:function(t,e,r,o){void 0===o&&(o=r),t[o]=e[r]}),n=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),i=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)"default"!==r&&Object.prototype.hasOwnProperty.call(t,r)&&o(e,t,r);return n(e,t),e},a=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var u=a(r(694)),s=i(r(149));e.default={Hrd:u.default,HrdHelper:s}},694:function(t,e,r){var o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(928)),i=o(r(84)),a=r(34),u=r(149),s=function(){function t(){this._moveMode=1,this._initBoard=[],this._queue=null,this._hashTable=null}return t.prototype.init=function(t,e){try{(0,u.verifyBoard)(t)}catch(t){console.error(t)}e&&(this._moveMode=e),this._initBoard=(0,u.convertBoardStr2BoardCharIndexArr)(t),this._queue=new i.default,this._hashTable=new n.default},t.prototype.statePropose=function(t,e){var r,o,n,i,s,c=t.key,l=t.board;if(null===(r=this._hashTable)||void 0===r?void 0:r.has("".concat(c)))return 0;if(null===(o=this._hashTable)||void 0===o||o.set("".concat(c),e),a.MIRROR_STATUS){var h=(0,u.boardCharIndexArr2Key)(l,!0);(null===(n=this._hashTable)||void 0===n?void 0:n.has("".concat(h)))||null===(i=this._hashTable)||void 0===i||i.set("".concat(h),e)}return null===(s=this._queue)||void 0===s||s.enqueue({board:l.slice(),key:c}),1},t.prototype.reachGoal=function(t){return a.GOAL_POS.every((function(e){var r=e[0],o=e[1],n=(0,u.convertBoardPos2Index)(r,o);return t[n]===a.GOAL_BLOCK_INDEX}))},t.prototype.find=function(){var t,e,r=Date.now(),o=[],n=(0,u.boardCharIndexArr2Key)(this._initBoard);this.statePropose({board:this._initBoard,key:n},0);for(var i=1;!(null===(t=this._queue)||void 0===t?void 0:t.isEmpty());){var a=null===(e=this._queue)||void 0===e?void 0:e.dequeue();if(this.reachGoal(a.board)){this.getAnswerList(a.key,o);break}i+=this.explore(a)}var s=Date.now();return this._hashTable=null,this._queue=null,{exploreCount:i,elapsedTime:(s-r)/1e3,boardList:o}},t.prototype.getAnswerList=function(t,e){var r,o=null===(r=this._hashTable)||void 0===r?void 0:r.get("".concat(t));o&&this.getAnswerList(o,e),e.push(t)},t.prototype.explore=function(t){for(var e=0,r=0,o=0;o<a.BOARD_SIZE[0];++o)for(var n=0;n<a.BOARD_SIZE[1];++n){var i=t.board;if(t.key,i[(0,u.convertBoardPos2Index)(o,n)]===a.EMPTY_BLOCK_CHAR_INDEX&&(e++,r+=this.slideVertical(t,0,o,n,-1,0),r+=this.slideVertical(t,0,o,n,1,0),r+=this.slideHorizontal(t,0,o,n,-1,0),r+=this.slideHorizontal(t,0,o,n,1,0),e>=a.EMPTY_BLOCK_COUNT))break}return r},t.prototype.slideVertical=function(t,e,r,o,n,i){var s=[r+n,o],c=s[0],l=s[1];if(c<0||c>=a.BOARD_SIZE[0])return 0;var h=t.board,d=t.key,f=h[(0,u.convertBoardPos2Index)(c,l)];if(f<=a.EMPTY_BLOCK_CHAR_INDEX)return 0;var _=(0,u.getBlockSize)(f),v=_[0],p=_[1],y=l-this.countLengthC(h,c,l,-1,f),O=y+p-1,B=0,C=h.slice(),A=d;do{var E=o-this.countLengthC(h,r,o,-1,a.EMPTY_BLOCK_CHAR_INDEX),I=o+this.countLengthC(h,r,o,1,a.EMPTY_BLOCK_CHAR_INDEX);if(y<E||O>I)return B;for(var b=y;b<=O;++b)C[(0,u.convertBoardPos2Index)(r,b)]=f,C[(0,u.convertBoardPos2Index)(r+v*n,b)]=a.EMPTY_BLOCK_CHAR_INDEX;var L={board:C,key:(0,u.boardCharIndexArr2Key)(C)};0!==e?B+=this.statePropose(L,e):(B+=this.statePropose(L,A),e=A),1===this._moveMode&&i<a.EMPTY_BLOCK_COUNT&&(E<y&&y===o&&(B+=this.slideHorizontal(L,e,r,o-1,1,i+1)),I>O&&O===o&&(B+=this.slideHorizontal(L,e,r,o+1,-1,i+1))),r-=n}while(3!==this._moveMode&&r>=0&&r<a.BOARD_SIZE[0]&&C[(0,u.convertBoardPos2Index)(r,o)]===a.EMPTY_BLOCK_CHAR_INDEX);return B},t.prototype.slideHorizontal=function(t,e,r,o,n,i){var s=[r,o+n],c=s[0],l=s[1];if(l<0||l>=a.BOARD_SIZE[1])return 0;var h=t.board,d=t.key,f=h[(0,u.convertBoardPos2Index)(c,l)];if(f<=a.EMPTY_BLOCK_CHAR_INDEX)return 0;var _=(0,u.getBlockSize)(f),v=_[0],p=_[1],y=c-this.countLengthR(h,c,l,-1,f),O=y+v-1,B=0,C=h.slice(),A=d;do{var E=r-this.countLengthR(h,r,o,-1,a.EMPTY_BLOCK_CHAR_INDEX),I=r+this.countLengthR(h,r,o,1,a.EMPTY_BLOCK_CHAR_INDEX);if(y<E||O>I)return B;for(var b=y;b<=O;++b)C[(0,u.convertBoardPos2Index)(b,o)]=f,C[(0,u.convertBoardPos2Index)(b,o+p*n)]=a.EMPTY_BLOCK_CHAR_INDEX;var L={board:C,key:(0,u.boardCharIndexArr2Key)(C)};0!==e?B+=this.statePropose(L,e):(B+=this.statePropose(L,A),e=A),1===this._moveMode&&i<a.EMPTY_BLOCK_COUNT&&(E<y&&y===r&&(B+=this.slideVertical(L,e,r-1,o,1,i+1)),I>O&&O===r&&(B+=this.slideVertical(L,e,r+1,o,-1,i+1))),o-=n}while(3!==this._moveMode&&o>=0&&o<a.BOARD_SIZE[1]&&C[(0,u.convertBoardPos2Index)(r,o)]===a.EMPTY_BLOCK_CHAR_INDEX);return B},t.prototype.countLengthC=function(t,e,r,o,n){var i=-1;do{i++,r+=o}while(r>=0&&r<a.BOARD_SIZE[1]&&t[(0,u.convertBoardPos2Index)(e,r)]===n);return i},t.prototype.countLengthR=function(t,e,r,o,n){var i=-1;do{i++,e+=o}while(e>=0&&e<a.BOARD_SIZE[0]&&t[(0,u.convertBoardPos2Index)(e,r)]===n);return i},t.prototype.printBoard=function(t,e){var r="key: ".concat(e,"\n\t\t").concat(t[0],",\t").concat(t[1],",\t").concat(t[2],",\t").concat(t[3],",\n\t\t").concat(t[4],",\t").concat(t[5],",\t").concat(t[6],",\t").concat(t[7],",\n\t\t").concat(t[8],",\t").concat(t[9],",\t").concat(t[10],",\t").concat(t[11],",\n\t\t").concat(t[12],",\t").concat(t[13],",\t").concat(t[14],",\t").concat(t[15],",\n\t\t").concat(t[16],",\t").concat(t[17],",\t").concat(t[18],",\t").concat(t[19],"\n\t\t");console.log("a :>> ",r)},t}();e.default=s},149:(t,e,r)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.key2BoardStringArr=e.boardCharIndexArr2Key=e.verifyBoard=e.getBlockSize=e.convertBoardPos2Index=e.convertBoardStr2BoardCharIndexArr=void 0;var o=r(34);function n(t,e){return e+t*o.BOARD_SIZE[1]}function i(t){return o.BLOCK_TYPE_LIST[o.BLOCK_INDEX_LIST[t]]}e.convertBoardStr2BoardCharIndexArr=function(t){return t.split("").map((function(t){return t.charCodeAt(0)-o.VOID_CHAR.charCodeAt(0)}))},e.convertBoardPos2Index=n,e.getBlockSize=i,e.verifyBoard=function(t){for(var e=t.split(""),r=o.BOARD_SIZE[0],a=o.BOARD_SIZE[1],u=0,s=[],c=0;c<r;++c){for(var l=0;l<a;++l){var h=e[n(c,l)];if("0"!==h){for(var d=h.charCodeAt(0)-o.VOID_CHAR.charCodeAt(0),f=i(d),_=f[0],v=f[1],p=0;p<_;++p){if(p+c>=r)throw new Error("wrong block at row:".concat(c,",col:").concat(l));for(var y=0;y<v;++y){if(y+l>=a)throw new Error("wrong block at row:".concat(c,",col:").concat(l));var O=n(p+c,y+l);if(e[O]!==h)throw new Error("wrong block at row:".concat(c,",col:").concat(l));e[O]="0"}}if(h===o.EMPTY_CHAR)u++;else if(s.includes(d))throw new Error("duplicate block at row:".concat(c,",col:").concat(l));s.push(d)}}if(u>o.EMPTY_BLOCK_COUNT)throw new Error("too many empty block!")}},e.boardCharIndexArr2Key=function(t,e){void 0===e&&(e=!1);var r=0,n=-1,i=0;e&&(r=-(o.BOARD_SIZE[1]+1));for(var a=0,u=t.length;a<u;++a){a%o.BOARD_SIZE[1]==0&&(r+=2*o.BOARD_SIZE[1]);var s=t[e?r-a:a];s!==o.GOAL_BLOCK_INDEX?i=(i<<2)+o.BLOCK_INDEX_LIST[s]:n<0&&(n=a)}return 16*i+n},e.key2BoardStringArr=function(t){var e,r=["@","N","B","H","A"],n=15&t,i=[];i[n]=r[4],i[n+1]=r[4],i[n+o.BOARD_SIZE[1]]=r[4],i[n+o.BOARD_SIZE[1]+1]=r[4],t=Math.floor(t/16);for(var a=o.BOARD_SIZE[0]*o.BOARD_SIZE[1]-1;a>=0;--a)if(i[a]!==r[4]&&(e=3&t,t>>=2,!i[a]))switch(e){case 0:i[a]=r[0];break;case 1:i[a]=r[1],r[1]=String.fromCharCode(r[1].charCodeAt(0)+1);break;case 2:i[a]=r[2],i[a-1]=r[2],r[2]=String.fromCharCode(r[2].charCodeAt(0)+1);break;case 3:i[a]=r[3],i[a-o.BOARD_SIZE[1]]=r[3],r[3]=String.fromCharCode(r[3].charCodeAt(0)+1);break;default:throw new Error("design error")}return i}},928:function(t,e,r){var o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(202)),i=function(){function t(t){void 0===t&&(t=32),this.buckets=Array(t).fill(null).map((function(){return new n.default})),this.keys={}}return t.prototype.hash=function(t){return Array.from(t).reduce((function(t,e){return t+e.charCodeAt(0)}),0)%this.buckets.length},t.prototype.set=function(t,e){var r=this.hash(t);this.keys[t]=r;var o=this.buckets[r],n=o.find({callback:function(e){return e.key===t}});n?n.value.value=e:o.append({key:t,value:e})},t.prototype.delete=function(t){var e=this.hash(t);delete this.keys[t];var r=this.buckets[e],o=r.find({callback:function(e){return e.key===t}});return o?r.delete(o.value):null},t.prototype.get=function(t){var e=this.buckets[this.hash(t)].find({callback:function(e){return e.key===t}});return e?e.value.value:void 0},t.prototype.has=function(t){return t in this.keys},t.prototype.getKeys=function(){return Object.keys(this.keys)},t.prototype.getValues=function(){return this.buckets.reduce((function(t,e){var r=e.toArray().map((function(t){return t.value.value}));return t.concat(r)}),[])},t}();e.default=i},202:function(t,e,r){var o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(596)),i=o(r(469)),a=function(){function t(t){this.head=null,this.tail=null,this.compare=new n.default(t)}return t.prototype.prepend=function(t){var e=new i.default(t,this.head);return this.head=e,this.tail||(this.tail=e),this},t.prototype.append=function(t){var e=new i.default(t);return this.head?(this.tail.next=e,this.tail=e,this):(this.head=e,this.tail=e,this)},t.prototype.delete=function(t){var e;if(!this.head)return null;for(var r=null;this.head&&this.compare.equal(this.head.value,t);)r=this.head,this.head=this.head.next;var o=this.head;if(null!==o)for(;o.next;)this.compare.equal(o.next.value,t)?(r=o.next,o.next=o.next.next):o=null==o?void 0:o.next;return this.compare.equal(null===(e=this.tail)||void 0===e?void 0:e.value,t)&&(this.tail=o),r},t.prototype.find=function(t){void 0===t&&(t={value:void 0});var e=t.value,r=t.callback;if(!this.head)return null;for(var o=this.head;o;){if(r&&r(o.value))return o;if(void 0!==e&&this.compare.equal(o.value,e))return o;o=o.next}return null},t.prototype.deleteTail=function(){var t=this.tail;if(this.head===this.tail)return this.head=null,this.tail=null,t;for(var e=this.head;null==e?void 0:e.next;)e.next.next?e=e.next:e.next=null;return this.tail=e,t},t.prototype.deleteHead=function(){if(!this.head)return null;var t=this.head;return this.head.next?this.head=this.head.next:(this.head=null,this.tail=null),t},t.prototype.fromArray=function(t){var e=this;return t.forEach((function(t){return e.append(t)})),this},t.prototype.toArray=function(){for(var t=[],e=this.head;e;)t.push(e),e=e.next;return t},t.prototype.toString=function(t){return this.toArray().map((function(e){return e.toString(t)})).toString()},t.prototype.reverse=function(){for(var t=this.head,e=null,r=null;t;)r=t.next,t.next=e,e=t,t=r;return this.tail=this.head,this.head=e,this},t}();e.default=a},469:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(t,e){void 0===e&&(e=null),this.value=t,this.next=e}return t.prototype.toString=function(t){return t?t(this.value):"".concat(this.value)},t}();e.default=r},84:function(t,e,r){var o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var n=o(r(202)),i=function(){function t(t){void 0===t&&(t=new n.default),this.linkedList=t}return t.prototype.isEmpty=function(){return!this.linkedList.head},t.prototype.peek=function(){return this.linkedList.head?this.linkedList.head.value:null},t.prototype.enqueue=function(t){this.linkedList.append(t)},t.prototype.dequeue=function(){var t=this.linkedList.deleteHead();return t?t.value:null},t.prototype.toString=function(t){return this.linkedList.toString(t)},t}();e.default=i},596:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(e){this.compare=e||t.defaultCompareFunction}return t.defaultCompareFunction=function(t,e){return t===e?0:t<e?-1:1},t.prototype.equal=function(t,e){return 0===this.compare(t,e)},t.prototype.lessThan=function(t,e){return this.compare(t,e)<0},t.prototype.greaterThan=function(t,e){return this.compare(t,e)>0},t.prototype.lessThanOrEqual=function(t,e){return this.lessThan(t,e)||this.equal(t,e)},t.prototype.greaterThanOrEqual=function(t,e){return this.greaterThan(t,e)||this.equal(t,e)},t.prototype.reverse=function(){var t=this.compare;this.compare=function(e,r){return t(r,e)}},t}();e.default=r},34:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.MIRROR_STATUS=e.EMPTY_BLOCK_COUNT=e.GOAL_POS=e.BLOCK_TYPE_LIST=e.BLOCK_INDEX_LIST=e.GOAL_TYPE_INDEX=e.GOAL_BLOCK_INDEX=e.EMPTY_BLOCK_CHAR_INDEX=e.EMPTY_CHAR=e.VOID_CHAR=e.BOARD_SIZE=void 0,e.BOARD_SIZE=[5,4],e.VOID_CHAR="?",e.EMPTY_CHAR="@",e.EMPTY_BLOCK_CHAR_INDEX=1,e.GOAL_BLOCK_INDEX=2,e.GOAL_TYPE_INDEX=4,e.BLOCK_INDEX_LIST=[-1,0,4,2,2,2,2,2,2,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1],e.BLOCK_TYPE_LIST=[[1,1],[1,1],[1,2],[2,1],[2,2]],e.GOAL_POS=[[4,1],[4,2]],e.EMPTY_BLOCK_COUNT=2,e.MIRROR_STATUS=!0}},e={};return function r(o){var n=e[o];if(void 0!==n)return n.exports;var i=e[o]={exports:{}};return t[o].call(i.exports,i,i.exports,r),i.exports}(492)})()}));