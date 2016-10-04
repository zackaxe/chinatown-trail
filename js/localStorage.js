'use strict';

var StorageObject = (function () {

    if (typeof (Storage) !== "undefined") {

        return {
            setPlan: function (name, data) {
                localStorage.setItem("MyRoutePlanner_" + name, JSON.stringify(data));
                alert("Saved as " + "MyRoutePlanner_" + name);
            },
            getPlansNames: function () {
                var plansList = [];
                for (var name in localStorage) {
                    if (name.substring(0, 15) == "MyRoutePlanner_") {
                        plansList.push(name);
                    }
                }
                return plansList;
            },
            getPlan: function (planName) {
                var plan = localStorage.getItem(planName);
                return JSON.parse(plan);
            }
        }
    }
    else {
        alert("No webStorage support :(")
        var loadButton = document.getElementById("loadButton");
        loadButton.disabled = true;
        var saveButton = document.getElements.getElementById("saveButton");
        saveButton.disabled = true;
    }
})();

