/*

MIT License

Copyright 2022 CY Fung

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
// ==UserScript==
// @name                YouTube Video Resize Fix
// @name:ja             YouTube Video Resize Fix
// @name:zh-TW          YouTube Video Resize Fix
// @name:zh-CN          YouTube Video Resize Fix
// @version             0.1.5
// @description         This Userscript can fix the video sizing issue. Please use it with other Userstyles / Userscripts.
// @description:ja      この Userscript は、動画のサイズ変更の問題を修正できます。 他のユーザースタイル・ユーザースクリプトと合わせてご利用ください。
// @description:zh-TW   此 Userscript 可以解決影片大小變形問題。 請將它與其他Userstyles / Userscripts一起使用。
// @description:zh-CN   此 Userscript 可以解决视频大小变形问题。请将它与其他Userstyles / Userscripts一起使用。
// @namespace           http://tampermonkey.net/
// @author              CY Fung
// @license             MIT License
// @supportURL          https://github.com/cyfung1031/userscript-supports
// @run-at              document-start
// @match               https://www.youtube.com/watch*
// @icon                https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant               none
// @unwrap
// @allFrames
// @inject-into page
// ==/UserScript==

/* jshint esversion:8 */

(function () {
  'use strict';
  const elements = {}
  let rid1 = 0
  let rid2 = 0
  /** @type {MutationObserver | null} */
  let attrObserver = null
  /** @type {ResizeObserver | null} */
  let resizeObserver = null
  let isHTMLAttrApplied = false
  const core = {
    begin() {
      document.addEventListener('yt-player-updated', core.hanlder, true)
      document.addEventListener('ytd-navigate-finish', core.hanlder, true)
    },
    hanlder() {
      rid1++
      if (rid1 > 1e9) rid1 = 9
      const tid = rid1
      window.requestAnimationFrame(() => {
        if (tid !== rid1) return
        core.runner()
      })
    },
    async runner() {
      if (!location.href.startsWith('https://www.youtube.com/watch')) return

      elements.ytdFlexy = document.querySelector('ytd-watch-flexy')
      elements.video = document.querySelector('ytd-watch-flexy #movie_player video')
      if (elements.ytdFlexy && elements.video) { } else return
      elements.moviePlayer = elements.video.closest('#movie_player')
      if (!elements.moviePlayer) return

      // resize Video
      let { ytdFlexy } = elements;
      if (!ytdFlexy.ElYTL) {
        ytdFlexy.ElYTL = 1;
        (function (ytdFlexy, calculateNormalPlayerSize_, calculateCurrentPlayerSize_) {
          ytdFlexy.calculateNormalPlayerSize_ = function () {
            rid2++
            return core.isSkip() ? calculateNormalPlayerSize_.call(this) : core.calculateSize();
          };
          ytdFlexy.calculateCurrentPlayerSize_ = function () {
            rid2++
            return core.isSkip() ? calculateCurrentPlayerSize_.call(this) : core.calculateSize();
          };
        })(ytdFlexy, ytdFlexy.calculateNormalPlayerSize_, ytdFlexy.calculateCurrentPlayerSize_);
      }
      ytdFlexy = null

      // when video is fetched
      elements.video.removeEventListener('canplay', core.triggerResizeDelayed, false)
      elements.video.addEventListener('canplay', core.triggerResizeDelayed, false)

      // when video is resized
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(core.triggerResizeDelayed);
        resizeObserver.observe(elements.moviePlayer)
      }

      // MutationObserver:[collapsed] @ ytd-live-chat-frame#chat
      if (attrObserver) {
        attrObserver.takeRecords()
        attrObserver.disconnect()
        attrObserver = null
      }
      let chat = document.querySelector('ytd-watch-flexy ytd-live-chat-frame#chat')
      if (chat) {
        // resize due to DOM update
        attrObserver = new MutationObserver(core.triggerResizeDelayed);
        attrObserver.observe(chat, { attributes: true, attributeFilter: ["collapsed"] });
        chat = null
      }

      // resize on idle
      core.triggerResizeDelayed()
    },
    isSkip() {
      const { ytdFlexy } = elements
      return ytdFlexy.theater === true || ytdFlexy.isTwoColumns_ === false || document.fullscreenElement !== null
    },
    calculateSize() {
      const { moviePlayer } = elements
      const rect = moviePlayer.getBoundingClientRect()
      if (!isHTMLAttrApplied) {
        isHTMLAttrApplied = true
        Promise.resolve(0).then(() => {
          document.documentElement.classList.add('youtube-video-resize-fix')
        }).catch(console.warn)
      }
      return { width: rect.width, height: rect.height };
    },
    triggerResizeDelayed() {
      rid2++
      if (rid2 > 1e9) rid2 = 9
      const tid = rid2
      window.requestAnimationFrame(() => {
        if (tid !== rid2) return
        window.dispatchEvent(new Event('resize'))
      })
    }
  };
  core.begin();
})();
