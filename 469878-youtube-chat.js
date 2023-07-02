// ==UserScript==
// @name                YouTube Super Fast Chat
// @version             0.2.4
// @license             MIT
// @name:ja             YouTube スーパーファーストチャット
// @name:zh-TW          YouTube 超快聊天
// @name:zh-CN          YouTube 超快聊天
// @namespace           UserScript
// @match               https://www.youtube.com/live_chat*
// @author              CY Fung
// @run-at              document-start
// @grant               none
// @unwrap
// @allFrames           true
// @inject-into         page
//
// @description         To make your YouTube Live Chat scroll instantly without smoothing transform CSS
// @description:ja      YouTubeライブチャットをスムーズな変形CSSなしで瞬時にスクロールさせるために。
// @description:zh-TW   讓您的 YouTube 直播聊天即時滾動，不經過平滑轉換 CSS。
// @description:zh-CN   让您的 YouTube 直播聊天即时滚动，不经过平滑转换 CSS。
//
// ==/UserScript==

((__CONTEXT__) => {

    const ACTIVE_DEFERRED_APPEND = false; // somehow buggy

    const ACTIVE_CONTENT_VISIBILITY = true;
    const ACTIVE_CONTAIN_SIZE = true;

    const addCss = () => document.head.appendChild(document.createElement('style')).textContent = [
        !ACTIVE_CONTENT_VISIBILITY ? '' : `

    @supports (contain:layout paint style) and (content-visibility:auto) and (contain-intrinsic-size:auto var(--wsr94)) {
      [wSr93] {
        content-visibility: visible;
      }

      [wSr93="hidden"]:nth-last-child(n+4) {
        content-visibility: auto;
        contain-intrinsic-size: auto var(--wsr94);
      }

    }

      `,

        !ACTIVE_CONTAIN_SIZE ? '' : `

    @supports (contain:layout paint style) {
      [wSr93*="i"] {
        height: var(--wsr94);
        box-sizing: border-box;
        contain: size layout style;
      }
    }
        `,

        `


    @supports (contain:layout paint style) {
      [wSr93*="i"] {
        height: var(--wsr94);
        box-sizing: border-box;
        contain: size layout style;
      }

      /* optional */
      #item-offset.style-scope.yt-live-chat-item-list-renderer {
        height: auto !important;
        min-height: unset !important;
      }

      #items.style-scope.yt-live-chat-item-list-renderer {
        transform: translateY(0px) !important;
      }

      /* optional */
      yt-icon[icon="down_arrow"] > *, yt-icon-button#show-more > * {
        pointer-events: none !important;
      }

      #item-list.style-scope.yt-live-chat-renderer, yt-live-chat-item-list-renderer.style-scope.yt-live-chat-renderer, #item-list.style-scope.yt-live-chat-renderer *, yt-live-chat-item-list-renderer.style-scope.yt-live-chat-renderer * {
        will-change: unset !important;
      }

      yt-img-shadow[height][width] {
        content-visibility: visible !important;
      }

      #item-offset.style-scope.yt-live-chat-item-list-renderer > #items.style-scope.yt-live-chat-item-list-renderer {
        position: static !important;
      }

      /* ------------------------------------------------------------------------------------------------------------- */
      yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip, yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer, yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer #image, yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer #image img {
        contain: layout style;
      }

      /*
      yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip,
      yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer,
      yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer #image,
      yt-live-chat-author-chip #chat-badges.yt-live-chat-author-chip yt-live-chat-author-badge-renderer #image img {
        contain: layout style;
        display: inline-flex;
        vertical-align: middle;
      }
      */
      #items yt-live-chat-text-message-renderer {
        contain: layout style;
      }

      yt-live-chat-item-list-renderer:not([allow-scroll]) #item-scroller.yt-live-chat-item-list-renderer {
        overflow-y: scroll;
        padding-right: 0;
      }

      body yt-live-chat-app {
        contain: size layout paint style;
        overflow: hidden;
      }

      #items.style-scope.yt-live-chat-item-list-renderer {
        contain: layout paint style;
      }

      #item-offset.style-scope.yt-live-chat-item-list-renderer {
        contain: style;
      }

      #item-scroller.style-scope.yt-live-chat-item-list-renderer {
        contain: size style;
      }

      #contents.style-scope.yt-live-chat-item-list-renderer, #chat.style-scope.yt-live-chat-renderer, img.style-scope.yt-img-shadow[width][height] {
        contain: size layout paint style;
      }

      .style-scope.yt-live-chat-ticker-renderer[role="button"][aria-label], .style-scope.yt-live-chat-ticker-renderer[role="button"][aria-label] > #container {
        contain: layout paint style;
      }

      yt-live-chat-text-message-renderer.style-scope.yt-live-chat-item-list-renderer, yt-live-chat-membership-item-renderer.style-scope.yt-live-chat-item-list-renderer, yt-live-chat-paid-message-renderer.style-scope.yt-live-chat-item-list-renderer, yt-live-chat-banner-manager.style-scope.yt-live-chat-item-list-renderer {
        contain: layout style;
      }

      tp-yt-paper-tooltip[style*="inset"][role="tooltip"] {
        contain: layout paint style;
      }

      /*
      #item-offset.style-scope.yt-live-chat-item-list-renderer {
        position: relative !important;
        height: auto !important;
      }
      */

      /* ------------------------------------------------------------------------------------------------------------- */


      #items.style-scope.yt-live-chat-item-list-renderer {
        padding-top: var(--items-top-padding);
      }

      #continuations, #continuations * {
        contain: strict;
        position: fixed;
        top: 2px;
        height: 1px;
        width: 2px;
        height: 1px;
        visibility: collapse;
      }

    }


        `




    ].join('\n');

    const { Promise, requestAnimationFrame } = __CONTEXT__;


    const isContainSupport = CSS.supports('contain', 'layout paint style');
    if (!isContainSupport) {
        console.error(`
  YouTube Light Chat Scroll: Your browser does not support 'contain'.
  Chrome >= 52; Edge >= 79; Safari >= 15.4, Firefox >= 69; Opera >= 39
  `.trim());
        return;
    }

    // const APPLY_delayAppendChild = false;

    let activeDeferredAppendChild = false;

    let delayedAppendParentWS = new WeakSet();
    let delayedAppendOperations = [];
    let commonAppendParentStackSet = new Set();

    let firstVisibleItemDetected = false;

    const sp7 = Symbol();


    let dt0 = Date.now() - 2000;
    const dateNow = () => Date.now() - dt0;
    let lastScroll = 0;
    let lastLShow = 0;
    let lastWheel = 0;

    const proxyHelperFn = (dummy) => ({

        get(target, prop) {
            return (prop in dummy) ? dummy[prop] : prop === sp7 ? target : target[prop];
        },
        set(target, prop, value) {
            if (!(prop in dummy)) {
                target[prop] = value;
            }
            return true;

        },
        has(target, prop) {
            return (prop in target)
        },
        deleteProperty(target, prop) {

            return true;
        },
        ownKeys(target) {
            return Object.keys(target);
        },
        defineProperty(target, key, descriptor) {
            return Object.defineProperty(target, key, descriptor);
            // return true;
        },
        getOwnPropertyDescriptor(target, key) {
            return Object.getOwnPropertyDescriptor(target, key);
        },



    });


    // const dummy3v = {
    //   "background": "",
    //   "backgroundAttachment": "",
    //   "backgroundBlendMode": "",
    //   "backgroundClip": "",
    //   "backgroundColor": "",
    //   "backgroundImage": "",
    //   "backgroundOrigin": "",
    //   "backgroundPosition": "",
    //   "backgroundPositionX": "",
    //   "backgroundPositionY": "",
    //   "backgroundRepeat": "",
    //   "backgroundRepeatX": "",
    //   "backgroundRepeatY": "",
    //   "backgroundSize": ""
    // };
    // for (const k of ['toString', 'getPropertyPriority', 'getPropertyValue', 'item', 'removeProperty', 'setProperty']) {
    //   dummy3v[k] = ((k) => (function () { const style = this[sp7]; return style[k](...arguments); }))(k)
    // }

    // const dummy3p = phFn(dummy3v);

    const pt2DecimalFixer = (x) => Math.round(x * 5, 0) / 5;

    const tickerContainerSetAttribute = function (attrName, attrValue) {

        let yd = (this.__dataHost || 0).__data;

        if (arguments.length === 2 && attrName === 'style' && yd && attrValue) {

            // let v = yd.containerStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
            let v = `${attrValue}`;
            // conside a ticker is 101px width
            // 1% = 1.01px
            // 0.2% = 0.202px

            const ratio1 = (yd.ratio * 100);
            const ratio2 = pt2DecimalFixer(ratio1);
            v = v.replace(`${ratio1}%`, `${ratio2}%`).replace(`${ratio1}%`, `${ratio2}%`)

            if (yd.__style_last__ === v) return;
            yd.__style_last__ = v;

            HTMLElement.prototype.setAttribute.call(this, attrName, v);



        } else {
            HTMLElement.prototype.setAttribute.apply(this, arguments);
        }

    };


    /*
     *
     *   const tickerContainerSetAttribute = function (attrName, attrValue) {

      const yd = (this.__dataHost||0).__data;
        if (arguments.length === 2 && attrName === 'style' && attrValue && yd){
            // let v = yd.containerStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
            let v = attrValue;

            // conside a ticker is 101px width
            // 1% = 1.01px
            // 0.2% = 0.202px
            const ratio1 = (yd.ratio * 100);
            const ratio2 = pt2DecimalFixer(ratio1);
            v = v.replace(`${ratio1}%`, `${ratio2}%`).replace(`${ratio1}%`, `${ratio2}%`)

          console.log(ratio1, ratio2)
            if (yd.__style_last__ !== v) {
              yd.__style_last__ = v; // clear along with data change

              HTMLElement.prototype.setAttribute.call(this, attrName, v);
              return;
            }


        }
      return HTMLElement.prototype.setAttribute.apply(this, arguments);

          };

          */


    const createDelayAppendOper = () => requestAnimationFrame(() => {
        const e = delayedAppendOperations.slice(0);
        delayedAppendOperations.length = 0;
        for (const t of e) t();
    });

    Node.prototype.appendChild = ((appendChild) => (function (s) {
        if (arguments.length !== 1) return appendChild.apply(this, arguments);
        // console.log(34, 1, this.is, this.nodeName, activeDeferredAppendChild, s.nodeName)
        let stack;

        // console.log(parentComponentName)

        if (ACTIVE_DEFERRED_APPEND && activeDeferredAppendChild && (commonAppendParentStackSet.has(stack = new Error().stack) || s.nodeName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') && typeof s.is === 'string') {

            commonAppendParentStackSet.add(stack);
            // this = '#document-fragment'
            /*
            if (this instanceof HTMLElement) {


              if (ops.length === 0) createRAF();
              ops.push(() => {
                appendChild.apply(this, arguments);
              })
              return s;

            } else {

              mpws.add(this);
              appendChild.apply(this, arguments);
              return s;
            }
            */
            delayedAppendParentWS.add(this);
            if (delayedAppendOperations.length === 0) createDelayAppendOper();
            delayedAppendOperations.push(() => {
                delayedAppendParentWS.delete(this);
                appendChild.apply(this, arguments);
            })
            return s;

        } else if (ACTIVE_DEFERRED_APPEND && activeDeferredAppendChild && delayedAppendParentWS.has(s)) {

            /*
            if (this instanceof HTMLElement) {
              if (ops.length === 0) createRAF();
              ops.push(() => {
                mpws.delete(s);
                appendChild.apply(this, arguments);
              })
              return s;
            } else {

              mpws.delete(s);
              appendChild.apply(this, arguments);
              return s;
            }
            */

            if (delayedAppendOperations.length === 0) createDelayAppendOper();
            delayedAppendOperations.push(() => {
                delayedAppendParentWS.delete(s);
                appendChild.apply(this, arguments);
            })
            return s;

        } else if (typeof this.countdownDurationMs === 'number') { // startCountdown
            //        } else if (this.nodeName === 'YT-LIVE-CHAT-TICKER-PAID-MESSAGE-ITEM-RENDERER' || this.nodeName === 'YT-LIVE-CHAT-TICKER-SPONSOR-ITEM-RENDERER') {

            if (this.classList.contains('yt-live-chat-ticker-renderer')) { // just in case
                appendChild.call(this, s);
                const container = (this.$ || 0).container;
                if (container) {
                    // const sp3v = new Proxy(container.style, dummy3p)
                    // Object.defineProperty(container, 'style', {get(){return sp3v}, set() { }, enumerable: true, configurable: true });
                    container.setAttribute = tickerContainerSetAttribute;
                }
                return s;
            }

        }
        // if(activeDeferredAppendChild) return null;
        appendChild.call(this, s);
        return s;
    }))(Node.prototype.appendChild);

    /*
    Node.prototype.append = ((append) => (function () {
      // console.log(34,2 )
      return append.apply(this, arguments);
    }))(Node.prototype.append);

    Node.prototype.insertBefore = ((insertBefore) => (function () {
      // console.log(34,3, this.is, this.nodeName, activeDeferredAppendChild)
      // if(activeDeferredAppendChild) return null;
      return insertBefore.apply(this, arguments);
    }))(Node.prototype.insertBefore);

    Node.prototype.insertAfter = ((insertAfter) => (function () {
      // console.log(34,4)
      return insertAfter.apply(this, arguments);
    }))(Node.prototype.insertAfter);

    */




    const fxOperator = (proto, propertyName) => {
        let propertyDescriptorGetter = null;
        try {
            propertyDescriptorGetter = Object.getOwnPropertyDescriptor(proto, propertyName).get;
        } catch (e) { }
        return typeof propertyDescriptorGetter === 'function' ? (e) => propertyDescriptorGetter.call(e) : (e) => e[propertyName];
    };

    const nodeParent = fxOperator(Node.prototype, 'parentNode');
    // const nFirstElem = fxOperator(HTMLElement.prototype, 'firstElementChild');
    const nPrevElem = fxOperator(HTMLElement.prototype, 'previousElementSibling');
    const nNextElem = fxOperator(HTMLElement.prototype, 'nextElementSibling');
    const nLastElem = fxOperator(HTMLElement.prototype, 'lastElementChild');


    /* globals WeakRef:false */

    /** @type {(o: Object | null) => WeakRef | null} */
    const mWeakRef = typeof WeakRef === 'function' ? (o => o ? new WeakRef(o) : null) : (o => o || null); // typeof InvalidVar == 'undefined'

    /** @type {(wr: Object | null) => Object | null} */
    const kRef = (wr => (wr && wr.deref) ? wr.deref() : wr);

    const watchUserCSS = () => {

        // if (!CSS.supports('contain-intrinsic-size', 'auto var(--wsr94)')) return;


        const clearContentVisibilitySizing = () => {
            Promise.resolve().then(() => {

                let btnShowMoreWR = mWeakRef(document.querySelector('#show-more[disabled]'));

                let lastVisibleItemWR = null;
                for (const elm of document.querySelectorAll('[wSr93]')) {
                    if (elm.getAttribute('wSr93') === 'visible') lastVisibleItemWR = mWeakRef(elm);
                    elm.setAttribute('wSr93', '');
                    // custom CSS property --wsr94 not working when attribute wSr93 removed
                }
                requestAnimationFrame(() => {
                    const btnShowMore = kRef(btnShowMoreWR); btnShowMoreWR = null;
                    if (btnShowMore && btnShowMore.isConnected) btnShowMore.click();
                    else {
                        // would not work if switch it frequently
                        const lastVisibleItem = kRef(lastVisibleItemWR); lastVisibleItemWR = null;
                        if (lastVisibleItem && lastVisibleItem.isConnected) {

                            Promise.resolve()
                                .then(() => lastVisibleItem.scrollIntoView())
                                .then(() => lastVisibleItem.scrollIntoView(false))
                                .then(() => lastVisibleItem.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" }))
                                .catch(e => { }) // break the chain when method not callable

                        }
                    }
                })



            })


        }
        const mutObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if ((mutation.addedNodes || 0).length >= 1) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeName === 'STYLE') {
                            clearContentVisibilitySizing();
                            return;
                        }
                    }
                }
                if ((mutation.removedNodes || 0).length >= 1) {
                    for (const removedNode of mutation.removedNodes) {
                        if (removedNode.nodeName === 'STYLE') {
                            clearContentVisibilitySizing();
                            return;
                        }
                    }
                }
            }
        });
        mutObserver.observe(document.documentElement, {
            childList: true,
            subtree: false
        })

        mutObserver.observe(document.head, {
            childList: true,
            subtree: false
        })
        mutObserver.observe(document.body, {
            childList: true,
            subtree: false
        });


    }

    let done = 0;
    let main = async (q) => {

        if (done) return;

        if (!q) return;
        let m1 = nodeParent(q);
        let m2 = q;
        if (!(m1 && m1.id === 'item-offset' && m2 && m2.id === 'items')) return;

        done = 1;

        Promise.resolve().then(watchUserCSS);

        addCss();

        const dummy1v = {
            transform: '',
            height: '',
            minHeight: '',
            paddingBottom: '',
            paddingTop: ''
        };
        for (const k of ['toString', 'getPropertyPriority', 'getPropertyValue', 'item', 'removeProperty', 'setProperty']) {
            dummy1v[k] = ((k) => (function () { const style = this[sp7]; return style[k](...arguments); }))(k)
        }

        const dummy1p = proxyHelperFn(dummy1v);
        const sp1v = new Proxy(m1.style, dummy1p);
        const sp2v = new Proxy(m2.style, dummy1p);
        Object.defineProperty(m1, 'style', { get() { return sp1v }, set() { }, enumerable: true, configurable: true });
        Object.defineProperty(m2, 'style', { get() { return sp2v }, set() { }, enumerable: true, configurable: true });
        m1.removeAttribute("style");
        m2.removeAttribute("style");

        let lastClick = 0;
        document.addEventListener('click', (evt) => {
            if (!evt.isTrusted) return;
            const target = ((evt || 0).target || 0)
            if (target.id === 'show-more') {
                if (target.nodeName !== 'YT-ICON-BUTTON') return;

                if (dateNow() - lastClick < 80) return;
                requestAnimationFrame(() => {
                    lastClick = dateNow();
                    target.click();
                })
            }

        })

        let btnShowMoreWR = null;

        const clickShowMore = () => {
            let btnShowMore = kRef(btnShowMoreWR);
            if (!btnShowMore || !btnShowMore.isConnected) {
                btnShowMore = document.querySelector('#show-more.yt-live-chat-item-list-renderer');
                btnShowMoreWR = mWeakRef(btnShowMore);
            }
            if (btnShowMore) btnShowMore.click();
        };

        let hasFirstShowMore = false;

        const visObserver = new IntersectionObserver((entries) => {

            for (const entry of entries) {

                const target = entry.target;
                if (!target) continue;
                let isVisible = entry.isIntersecting === true && entry.intersectionRatio > 0.5;
                if (isVisible) {
                    target.style.setProperty('--wsr94', entry.boundingClientRect.height + 'px');
                    target.setAttribute('wSr93', 'visible');
                    if (nNextElem(target) === null) {
                        firstVisibleItemDetected = true;
                        if (dateNow() - lastScroll < 80) {
                            lastLShow = 0;
                            lastScroll = 0;
                            Promise.resolve().then(clickShowMore);
                        } else {
                            lastLShow = dateNow();
                        }
                    } else if (!hasFirstShowMore) { // should more than one item being visible
                        // implement inside visObserver to ensure there is sufficient delay
                        hasFirstShowMore = true;
                        requestAnimationFrame(() => {
                            // foreground page
                            activeDeferredAppendChild = true;
                            // page visibly ready -> load the latest comments at initial loading
                            clickShowMore();
                        });
                    }
                }
                else if (target.getAttribute('wSr93') === 'visible') { // ignore target.getAttribute('wSr93') === '' to avoid wrong sizing

                    target.style.setProperty('--wsr94', entry.boundingClientRect.height + 'px');
                    target.setAttribute('wSr93', 'hidden');
                } // note: might consider 0 < entry.intersectionRatio < 0.5 and target.getAttribute('wSr93') === '' <new last item>

            }

        }, {
            /*
        root: items,
        rootMargin: "0px",
        threshold: 1.0,
        */
            root: HTMLElement.prototype.closest.call(m2, '#item-scroller.yt-live-chat-item-list-renderer'), // nullable
            rootMargin: "0px",
            threshold: [0.05, 0.95],
        });

        //m2.style.visibility='';

        const mutFn = (items) => {
            for (let node = nLastElem(items); node !== null; node = nPrevElem(node)) {
                if (node.hasAttribute('wSr93')) break;
                node.setAttribute('wSr93', '');
                visObserver.observe(node);
            }
        }

        const mutObserver = new MutationObserver((mutations) => {
            const items = (mutations[0] || 0).target;
            if (!items) return;
            mutFn(items);
        });
        mutObserver.observe(m2, {
            childList: true,
            subtree: false
        });
        mutFn(m2);


        /** @type {HTMLElement} */
        let c1 = nPrevElem(m1);
        if (c1 && c1.id === "live-chat-banner") {
            let rsObserver = new ResizeObserver((entries) => {

                for (const entry of entries) {
                    const target = entry.target;
                    if (target && target.id === "live-chat-banner") {
                        let p = entry.borderBoxSize ? (entry.borderBoxSize[0] || 0).blockSize : 0;
                        let c1h = p > entry.contentRect.height ? p : entry.contentRect.height + 16;
                        document.documentElement.style.setProperty('--items-top-padding', (Math.ceil(c1h / 2) * 2) + 'px');
                    }
                }

            });
            rsObserver.observe(c1);
        }

        document.addEventListener('scroll', (evt) => {

            if (!evt || !evt.isTrusted) return;
            if (!firstVisibleItemDetected) return;
            const isUserAction = dateNow() - lastWheel < 80; // continuous wheel -> continuous scroll -> continuous wheel -> continuous scroll
            if (!isUserAction) return;

            if (dateNow() - lastLShow < 80) {
                lastLShow = 0;
                lastScroll = 0;
                Promise.resolve().then(clickShowMore);
            } else {
                lastScroll = dateNow();
            }

        }, { passive: true, capture: true }) // support contain => support passive


        document.addEventListener('wheel', (evt) => {

            if (!evt || !evt.isTrusted) return;
            lastWheel = dateNow();

        }, { passive: true, capture: true }) // support contain => support passive

    };


    function onReady() {
        let tmObserver = new MutationObserver(() => {

            let p = document.getElementById('items'); // fast
            if (!p) return;
            let q = document.querySelector('#item-offset.style-scope.yt-live-chat-item-list-renderer > #items.style-scope.yt-live-chat-item-list-renderer'); // check

            if (q) {
                tmObserver.disconnect();
                tmObserver.takeRecords();
                tmObserver = null;
                Promise.resolve(q).then((q) => {
                    // confirm Promis.resolve() is resolveable
                    // execute main without direct blocking
                    main(q);
                })
            }

        });

        tmObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    if (document.readyState != 'loading') {
        onReady();
    } else {
        window.addEventListener("DOMContentLoaded", onReady, false);
    }

})({ Promise, requestAnimationFrame });
