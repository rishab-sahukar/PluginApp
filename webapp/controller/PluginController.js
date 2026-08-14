sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/BusyDialog",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/TextArea',
	'sap/m/MessageToast',
	'sap/m/VBox'
], function (Controller, BusyDialog, Button, Dialog, Text, TextArea, MessageToast, VBox) {
	"use strict";

	/**
	 * @class sap.we.ui.pluginapp.controller.PluginController
	 */
	return Controller.extend("sap.we.ui.pluginapp.controller.PluginController", {

		/**
		 * Convenience method for accessing the router.
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the element by ID.
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @param {string} [sId] the element ID
		 * @returns {object} the element
		 */
		byId: function (sId) {
			return sap.ui.getCore().byId(sId);
		},

		/**
		 * Function to determain Oris Returns or Cross-Border Returns
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @return {boolean} true if Oris, false if CBR
		 */
		_isOrisReturn: function () {
			let oMainModel = this.getModel("mainModel"),
				fOris = oMainModel.getProperty("/orderData/OrisReturn");
			if (fOris) {
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Function to determain HU without Delivery Returns
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @return {boolean} true if HU without Delivery, false if With Delivery
		 */
		_isHuWoDlvReturn: function () {
			let oMainModel = this.getModel("mainModel"),
				fHuWoDlv = oMainModel.getProperty("/orderData/HuWoDlv");
			if (fHuWoDlv !== "") {
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Getter for the resource bundle.
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Wrapper for GET requests
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @param {Object} oModel sapui5 model object to be supplemented
		 * @param {String} sUrl data set url
		 * @param {String} sProperty property in model to be written path
		 * @param {Array} aFilters array of filters to add to request
		 * @param {String} sCallNext name of function to be called after data recieved. Could be array of functions
		 * @summary Gets attachments data and sets it to selected model
		 * @public
		 */
		getServiceData: function (oModel, sUrl, sProperty, aFilters, sCallNext, oExpand) {
			var oContext = this;

			if (!aFilters) { aFilters = []; }
			if (!oExpand) { oExpand = {}; }
			this.getOwnerComponent().getModel().read(sUrl, {
				filters: aFilters,
				urlParameters: oExpand,
				success: jQuery.proxy(function (oRetrievedData, oResponse) {
					if (oRetrievedData.results) {
						oModel.setProperty(sProperty, oRetrievedData.results);
					} else {
						oModel.setProperty(sProperty, oRetrievedData);
					}
					if (sCallNext) {
						if (sCallNext.constructor === Array) {
							sCallNext.forEach(function (sFunctionName) {
								sFunctionName.call(oContext);
							});
						} else {
							sCallNext.call(oContext);
						}
					}
				}, this),
				error: jQuery.proxy(function (oError) {
					oContext._hideBusyDialog();
					jQuery.sap.log.error(sUrl + " Error retrieving data for Send model");
				}, this)
			});
		},

		/**
		 * Wrapper for UPDATE requests
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @param {String} sUrl set urk to send
		 * @param {Object} oEntry object to send
		 * @param {String} sCallNext name of function to be called after data recieved. Could be array of functions
		 * @summary send data to url via UPDATE
		 * @private
		 */
		_updateMethodForBE: function (sUrl, oEntry, sCallNext) {
			var oContext = this;
			this.getOwnerComponent().getModel().update(sUrl, oEntry, {
				success: jQuery.proxy(function (oRetrievedData, oResponse) {
					if (sCallNext) {
						if (sCallNext.constructor === Array) {
							sCallNext.forEach(function (sFunctionName) {
								sFunctionName.call(oContext);
							});
						} else {
							sCallNext.call(oContext);
						}
					}
				}, this),
				error: jQuery.proxy(function (oError) {
					oContext._hideBusyDialog();
					jQuery.sap.log.error(sUrl + " Error sending data for Send model");
				}, this)
			});
		},

		/**
		 * Wrapper for CREATE requests
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @param {String} sUrl set urk to send
		 * @param {Object} oEntry object to send
		 * @param {String} aCallBacks name of function to be called after data recieved. Could be array of functions
		 * @summary send data to url via CREATE
		 * @private
		 */

		_createMethodForBE: function (sUrl, oEntry, aCallBacks) {
			var oContext = this;
			this.getOwnerComponent().getModel().create(sUrl, oEntry, {
				success: jQuery.proxy(function (oRetrievedData, oResponse) {
					if (aCallBacks && Array.isArray(aCallBacks)) {
						aCallBacks.forEach(function (fnCallback) {
							if (typeof fnCallback === "function") {
								fnCallback.call(oContext);
							}
						});
					}
				}, this),
				error: jQuery.proxy(function (oError) {
					oContext._hideBusyDialog();
					jQuery.sap.log.error(sUrl + " Error sending data for Surplus Item creation");
				}, this)
			});
		},

		/**
		 * SAPUI5 BusyDialog control
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 */
		_busyDialog: new BusyDialog(),

		/**
		 * Convenience method to show busy dialog
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 */
		_showBusyDialog: function () {
			this._busyDialog.open();
		},

		/**
		 * Convenience method to hide busy dialog
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @public
		 */
		_hideBusyDialog: function () {
			jQuery.sap.delayedCall(0, this, function () {
				this._busyDialog.close();
			});
		},


		/**
		 * Compare objects or arrays
		 * @method
		 * @memberof sap.we.ui.pluginapp.controller.PluginController
		 * @param {object} oA - object/array A
		 * @param {object} oB - object/array B
		 * @public
		 * @return {boolean} true if A == B
		 */
		compare: function (oA, oB) {
			if (oA && oB) {
				if (JSON.stringify(oA) === JSON.stringify(oB)) { return true; }
			}
			return false;
		},

		/**         
         * Reusable function to open any fragment       
         * @param {string} sFragmentName Full fragment path        
         * @param {string} sFragmentId Unique fragment ID        
         * @returns {Promise} Fragment instance        
         */
        openFragment: async function (sFragmentName, sFragmentId, oSource) {
            this._mFragments = this._mFragments || {};

            if (!this._mFragments[sFragmentId]) {
                this._mFragments[sFragmentId] = await Fragment.load({
                    id: this.getView().getId(),
                    name: sFragmentName,
                    controller: this
                });

                this.getView().addDependent(this._mFragments[sFragmentId]);
            }

            const oFragment = this._mFragments[sFragmentId];

            if (oFragment.openBy && oSource) {
                oFragment.openBy(oSource); // Popover
            } else if (oFragment.open) {
                oFragment.open(); // Dialog
            }

            return oFragment;
        },

		/**
		  * @method
		  * @memberof sap.we.ui.pluginapp.controller.PluginController
		  * @param {Object} oResponse success responce object. BE sends errors there
		  * @param {String} bWarning dialog type flag
		  * @summary Opens warning dialog
		  * @private
		*/
		_showWarningDialog: function (oResponse, bWarning) {
			var sDialogTitle = this.getResourceBundle().getText(true ? 'sysWarnTitle' : 'sysInfoTitle');
			var sOkText = this.getResourceBundle().getText('OkBtnText');
			var oInfoDialog = new Dialog({
				title: sDialogTitle,
				type: 'Message',
				state: true ? 'Warning' : 'None',
				content: [
					new VBox({
						items: [
							new Text({
								text: oResponse.MessageText
							}).addStyleClass("sapUiSmallMarginBottom"),
							new TextArea({
								visible: !!(oResponse.MessageTextLong),
								growing: true,
								width: "100%",
								editable: false,
								value: oResponse.MessageTextLong
							})
						]
					})],

				beginButton: new Button({
					text: sOkText,
					press: function () {
						oInfoDialog.close();
					}
				}),

				afterClose: function () {
					oInfoDialog.destroy();
				}
			});

			oInfoDialog.open();
		}
	});
}
);
