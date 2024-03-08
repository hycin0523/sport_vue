import Vue from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

Vue.directive("highlight", (el) => {
  let selectorAll = el.querySelectorAll("pre code");
  selectorAll.forEach((item) => {
    hljs.highlightBlock(item);
  });
});