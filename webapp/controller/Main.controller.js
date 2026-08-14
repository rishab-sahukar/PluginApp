sap.ui.define([
    "sap/we/ui/pluginapp/controller/PluginController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (PluginController, Controller, Fragment, MessageToast, MessageBox) => {
    "use strict";

    return PluginController.extend("sap.we.ui.pluginapp.controller.Main", {
        onInit() {
        },

        // <-========================================== FRAGMENT PLUGIN =================================================->

        onOpenFragment(oEvent) {
            // Implementation for opening fragment
            this.openFragment("sap.we.ui.pluginapp.fragments.openFragment", "employeeDialog", oEvent.getSource());
        },

        onCloseDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        }

    });
});