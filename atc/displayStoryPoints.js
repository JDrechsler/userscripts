// ==UserScript==
// @name         Display Story Points
// @namespace    https://atc.bmwgroup.net/
// @version      0.1
// @description  Display Story Points
// @author       JDrechslerUS
// @include      /https:\/\/atc\.bmwgroup\.net\/jira\/browse\/CHGFRWRDUS-\d+/
// @grant        none
// @require      file://C:\Scripts\displayStoryPoints.js
// ==/UserScript==

function getCurrentJiraIssueKey() {
  let currentIssueKeyEl = document.getElementById("key-val");
  return currentIssueKeyEl.textContent;
}
function getAtlToken() {
  return document.getElementsByName("atl_token")[0].value
}
async function makePostRequest(currentJiraIssueKey, numStoryPoints) {
  let resGet = await fetch(
    `https://atc.bmwgroup.net/jira/rest/greenhopper/1.0/xboard/issue/details.json?rapidViewId=29195&issueIdOrKey=${currentJiraIssueKey}`
  );
  let dataGet = await resGet.json();
  let jiraIssueId = dataGet.id;
  if (dataGet === undefined) {
    console.log("Could not fetch data for:", currentJiraIssueKey);
  } else {
    let res = await fetch(
      "https://atc.bmwgroup.net/jira/secure/DetailsViewAjaxIssueAction.jspa?decorator=none",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-ausername": "qxz0rmr",
          "x-requested-with": "XMLHttpRequest",
          "x-sitemesh-off": "true",
        },
        referrer:
          "https://atc.bmwgroup.net/jira/secure/RapidBoard.jspa?rapidView=29195&projectKey=CHGFRWRDUS&view=planning&selectedIssue=CHGFRWRDUS-430&issueLimit=100",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `customfield_10006=${numStoryPoints}&issueId=${jiraIssueId}&atl_token=${getAtlToken()}&singleFieldEdit=true&fieldsToForcePresent=customfield_10006&skipScreenCheck=true&rapidViewId=29195`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    let data = await res.json();
    if (data.atl_token !== undefined) {
      console.log("Story Points were edited for", currentJiraIssueKey);
      location.reload();
    } else {
      console.log("Story Points could not be edited for", currentJiraIssueKey);
    }
  }
}
async function addStoryPointsToDom(numStoryPoints) {
  let issueDetails = document.getElementById("issuedetails");
  let firstChildClone = issueDetails.firstElementChild.cloneNode(true);
  firstChildClone.className = "item item-right";
  firstChildClone.firstElementChild.firstElementChild.textContent =
    "Story Points:";
  firstChildClone.firstElementChild.lastElementChild.firstElementChild.replaceWith(
    ""
  );
  firstChildClone.firstElementChild.lastElementChild.id = "story-points-val";
  firstChildClone.firstElementChild.lastElementChild.textContent = numStoryPoints;
  issueDetails.prepend(firstChildClone);

  let storyPointsValEl = document.getElementById("story-points-val");
  if (storyPointsValEl !== undefined) {
    storyPointsValEl.addEventListener("click", async function () {
      let newStoryPointsVal = prompt(
        `Please enter new story point value for ${getCurrentJiraIssueKey()}`
      );
      if (newStoryPointsVal > 0) {
        let currentJiraIssueKey = getCurrentJiraIssueKey();
        await makePostRequest(currentJiraIssueKey, newStoryPointsVal);
        console.log("new story points val:", newStoryPointsVal);
      }
    });
  }
}
async function makeGetRequest(currentJiraIssueKey) {
  let res = await fetch(
    `https://atc.bmwgroup.net/jira/rest/greenhopper/1.0/xboard/issue/details.json?rapidViewId=29195&issueIdOrKey=${currentJiraIssueKey}`
  );
  let data = await res.json();
  if (data.key === undefined) {
    console.log("Could not fetch details for:", currentJiraIssueKey);
  } else {
    let tabHeader = data.tabs.defaultTabs.find((tab) => (tab.tabId = "HEADER"));
    let storyPointsObj = tabHeader.fields.find(
      (field) =>
        field.id === "customfield_10006" &&
        field.label === "Story Points" &&
        field.type === "number"
    );
    if (storyPointsObj.type === "number") {
      let storyPoints = storyPointsObj.text;
      console.log(`${currentJiraIssueKey} - Story Points:`, storyPoints);
      return storyPoints;
    } else {
      console.log("Story points could not be found", storyPointsObj);
    }
  }
}
async function runScript() {
  let currentJiraIssueKey = getCurrentJiraIssueKey();
  let currentStoryPoints = await makeGetRequest(currentJiraIssueKey);
  if (currentStoryPoints > 0) {
    await addStoryPointsToDom(currentStoryPoints);
  }
}

(async function () {
  await runScript();
})();
