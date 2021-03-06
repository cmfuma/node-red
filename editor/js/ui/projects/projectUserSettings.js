/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

RED.projects.userSettings = (function() {

    var gitUsernameInput;
    var gitEmailInput;

    function createGitUserSection(pane) {

        var currentGitSettings = RED.settings.get('git') || {};
        currentGitSettings.user = currentGitSettings.user || {};

        var title = $('<h3></h3>').text("Committer Details").appendTo(pane);

        var gitconfigContainer = $('<div class="user-settings-section"></div>').appendTo(pane);
        $('<div style="color:#aaa;"></div>').appendTo(gitconfigContainer).text("Leave blank to use system default");

        var row = $('<div class="user-settings-row"></div>').appendTo(gitconfigContainer);
        $('<label for=""></label>').text('Username').appendTo(row);
        gitUsernameInput = $('<input type="text">').appendTo(row);
        gitUsernameInput.val(currentGitSettings.user.name||"");

        row = $('<div class="user-settings-row"></div>').appendTo(gitconfigContainer);
        $('<label for=""></label>').text('Email').appendTo(row);
        gitEmailInput = $('<input type="text">').appendTo(row);
        gitEmailInput.val(currentGitSettings.user.email||"");
    }


    function createSSHKeySection(pane) {
        var container = $('<div class="user-settings-section"></div>').appendTo(pane);
        var popover;
        var title = $('<h3></h3>').text("SSH Keys").appendTo(container);
        var subtitle = $('<div style="color:#aaa;"></div>').appendTo(container).text("Allows you to create secure connections to remote git repositories.");

        var addKeyButton = $('<button id="user-settings-gitconfig-add-key" class="editor-button editor-button-small" style="float: right; margin-right: 10px;">add key</button>')
            .appendTo(subtitle)
            .click(function(evt) {
                addKeyButton.attr('disabled',true);
                saveButton.attr('disabled',true);
                // bg.children().removeClass("selected");
                // addLocalButton.click();
                addKeyDialog.slideDown(200);
                keyNameInput.focus();
            });

        var validateForm = function() {
            var valid = /^[a-zA-Z0-9\-_]+$/.test(keyNameInput.val());
            keyNameInput.toggleClass('input-error',keyNameInputChanged&&!valid);

            // var selectedButton = bg.find(".selected");
            // if (selectedButton[0] === addLocalButton[0]) {
            //     valid = valid && localPublicKeyPathInput.val().length > 0 && localPrivateKeyPathInput.val().length > 0;
            // } else if (selectedButton[0] === uploadButton[0]) {
            //     valid = valid && publicKeyInput.val().length > 0 && privateKeyInput.val().length > 0;
            // } else if (selectedButton[0] === generateButton[0]) {
                var passphrase = passphraseInput.val();
                var validPassphrase = passphrase.length === 0 || passphrase.length >= 8;
                passphraseInput.toggleClass('input-error',!validPassphrase);
                if (!validPassphrase) {
                    passphraseInputSubLabel.text("Passphrase too short");
                } else if (passphrase.length === 0) {
                    passphraseInputSubLabel.text("Optional");
                } else {
                    passphraseInputSubLabel.text("");
                }
                valid = valid && validPassphrase;
            // }

            saveButton.attr('disabled',!valid);

            if (popover) {
                popover.close();
                popover = null;
            }
        };

        var row = $('<div class="user-settings-row"></div>').appendTo(container);
        var addKeyDialog = $('<div class="projects-dialog-list-dialog"></div>').hide().appendTo(row);
        $('<div class="projects-dialog-list-dialog-header">').text('Add SSH Key').appendTo(addKeyDialog);
        var addKeyDialogBody = $('<div>').appendTo(addKeyDialog);

        row = $('<div class="user-settings-row"></div>').appendTo(addKeyDialogBody);
        $('<div style="color:#aaa;"></div>').appendTo(row).text("Generate a new public/private key pair");
        // var bg = $('<div></div>',{class:"button-group", style:"text-align: center"}).appendTo(row);
        // var addLocalButton = $('<button class="editor-button toggle selected">use local key</button>').appendTo(bg);
        // var uploadButton = $('<button class="editor-button toggle">upload key</button>').appendTo(bg);
        // var generateButton = $('<button class="editor-button toggle">generate key</button>').appendTo(bg);
        // bg.children().click(function(e) {
        //     e.preventDefault();
        //     if ($(this).hasClass("selected")) {
        //         return;
        //     }
        //     bg.children().removeClass("selected");
        //     $(this).addClass("selected");
        //     if (this === addLocalButton[0]) {
        //         addLocalKeyPane.show();
        //         generateKeyPane.hide();
        //         uploadKeyPane.hide();
        //     } else if (this === uploadButton[0]) {
        //         addLocalKeyPane.hide();
        //         generateKeyPane.hide();
        //         uploadKeyPane.show();
        //     } else if (this === generateButton[0]){
        //         addLocalKeyPane.hide();
        //         generateKeyPane.show();
        //         uploadKeyPane.hide();
        //     }
        //     validateForm();
        // })


        row = $('<div class="user-settings-row"></div>').appendTo(addKeyDialogBody);
        $('<label for=""></label>').text('Name').appendTo(row);
        var keyNameInputChanged = false;
        var keyNameInput = $('<input type="text">').appendTo(row).on("change keyup paste",function() {
            keyNameInputChanged = true;
            validateForm();
        });
        $('<label class="projects-edit-form-sublabel"><small>Must contain only A-Z 0-9 _ -</small></label>').appendTo(row).find("small");

        var generateKeyPane = $('<div>').appendTo(addKeyDialogBody);
        row = $('<div class="user-settings-row"></div>').appendTo(generateKeyPane);
        $('<label for=""></label>').text('Passphrase').appendTo(row);
        var passphraseInput = $('<input type="password">').appendTo(row).on("change keyup paste",validateForm);
        var passphraseInputSubLabel = $('<label class="projects-edit-form-sublabel"><small>Optional</small></label>').appendTo(row).find("small");

        // var addLocalKeyPane = $('<div>').hide().appendTo(addKeyDialogBody);
        // row = $('<div class="user-settings-row"></div>').appendTo(addLocalKeyPane);
        // $('<label for=""></label>').text('Public key').appendTo(row);
        // var localPublicKeyPathInput = $('<input type="text">').appendTo(row).on("change keyup paste",validateForm);
        // $('<label class="projects-edit-form-sublabel"><small>Public key file path, for example: ~/.ssh/id_rsa.pub</small></label>').appendTo(row).find("small");
        // row = $('<div class="user-settings-row"></div>').appendTo(addLocalKeyPane);
        // $('<label for=""></label>').text('Private key').appendTo(row);
        // var localPrivateKeyPathInput = $('<input type="text">').appendTo(row).on("change keyup paste",validateForm);
        // $('<label class="projects-edit-form-sublabel"><small>Private key file path, for example: ~/.ssh/id_rsa</small></label>').appendTo(row).find("small");
        //
        // var uploadKeyPane = $('<div>').hide().appendTo(addKeyDialogBody);
        // row = $('<div class="user-settings-row"></div>').appendTo(uploadKeyPane);
        // $('<label for=""></label>').text('Public key').appendTo(row);
        // var publicKeyInput = $('<textarea>').appendTo(row).on("change keyup paste",validateForm);
        // $('<label class="projects-edit-form-sublabel"><small>Paste in public key contents, for example: ~/.ssh/id_rsa.pub</small></label>').appendTo(row).find("small");
        // row = $('<div class="user-settings-row"></div>').appendTo(uploadKeyPane);
        // $('<label for=""></label>').text('Private key').appendTo(row);
        // var privateKeyInput = $('<textarea>').appendTo(row).on("change keyup paste",validateForm);
        // $('<label class="projects-edit-form-sublabel"><small>Paste in private key contents, for example: ~/.ssh/id_rsa</small></label>').appendTo(row).find("small");




        var hideEditForm = function() {
            addKeyButton.attr('disabled',false);
            addKeyDialog.hide();

            keyNameInput.val("");
            keyNameInputChanged = false;
            passphraseInput.val("");
            // localPublicKeyPathInput.val("");
            // localPrivateKeyPathInput.val("");
            // publicKeyInput.val("");
            // privateKeyInput.val("");
            if (popover) {
                popover.close();
                popover = null;
            }
        }
        var formButtons = $('<span class="button-row" style="position: relative; float: right; margin: 10px;"></span>').appendTo(addKeyDialog);
        $('<button class="editor-button">Cancel</button>')
            .appendTo(formButtons)
            .click(function(evt) {
                evt.preventDefault();
                hideEditForm();
            });
        var saveButton = $('<button class="editor-button">Generate key</button>')
            .appendTo(formButtons)
            .click(function(evt) {
                evt.preventDefault();
                var spinner = utils.addSpinnerOverlay(addKeyDialog).addClass('projects-dialog-spinner-contain');
                var payload = {
                    name: keyNameInput.val()
                };

                // var selectedButton = bg.find(".selected");
                // if (selectedButton[0] === addLocalButton[0]) {
                //     payload.type = "local";
                //     payload.publicKeyPath = localPublicKeyPathInput.val();
                //     payload.privateKeyPath = localPrivateKeyPathInput.val();
                // } else if (selectedButton[0] === uploadButton[0]) {
                //     payload.type = "upload";
                //     payload.publicKey = publicKeyInput.val();
                //     payload.privateKey = privateKeyInput.val();
                // } else if (selectedButton[0] === generateButton[0]) {
                    payload.type = "generate";
                    payload.comment = gitEmailInput.val();
                    payload.password = passphraseInput.val();
                    payload.size = 4096;
                // }
                var done = function(err) {
                    spinner.remove();
                    if (err) {
                        return;
                    }
                    hideEditForm();
                }
                // console.log(JSON.stringify(payload,null,4));
                RED.deploy.setDeployInflight(true);
                utils.sendRequest({
                    url: "settings/user/keys",
                    type: "POST",
                    responses: {
                        0: function(error) {
                            done(error);
                        },
                        200: function(data) {
                            refreshSSHKeyList(payload.name);
                            done();
                        },
                        400: {
                            'unexpected_error': function(error) {
                                console.log(error);
                                done(error);
                            }
                        },
                    }
                },payload);
            });

        row = $('<div class="user-settings-row projects-dialog-list"></div>').appendTo(container);
        var emptyItem = { empty: true };
        var expandKey = function(container,entry) {
            var row = $('<div class="projects-dialog-ssh-public-key">',{style:"position:relative"}).appendTo(container);
            var keyBox = $('<pre>',{style:"min-height: 80px"}).appendTo(row);
            var spinner = utils.addSpinnerOverlay(keyBox).addClass('projects-dialog-spinner-contain');
            var options = {
                url: 'settings/user/keys/'+entry.name,
                type: "GET",
                responses: {
                    200: function(data) {
                        keyBox.text(data.publickey);
                        spinner.remove();
                    },
                    400: {
                        'unexpected_error': function(error) {
                            console.log(error);
                            spinner.remove();
                        }
                    },
                }
            }
            utils.sendRequest(options);

            var formButtons = $('<span class="button-row" style="position: relative; float: right; margin: 10px;"></span>').appendTo(row);
            $('<button class="editor-button editor-button-small">Copy public key to clipboard</button>')
                .appendTo(formButtons)
                .click(function(evt) {
                    try {
                        evt.stopPropagation();
                        evt.preventDefault();
                        document.getSelection().selectAllChildren(keyBox[0]);
                        var ret = document.execCommand('copy');
                        document.getSelection().empty();
                    } catch(err) {

                    }

                });

            return row;
        }
        var keyList = $('<ol class="projects-dialog-ssh-key-list">').appendTo(row).editableList({
            height: 'auto',
            addButton: false,
            scrollOnAdd: false,
            addItem: function(row,index,entry) {
                var container = $('<div class="projects-dialog-list-entry">').appendTo(row);
                if (entry.empty) {
                    container.addClass('red-ui-search-empty');
                    container.text("No SSH keys");
                    return;
                }
                var topRow = $('<div class="projects-dialog-ssh-key-header">').appendTo(container);
                $('<span class="entry-icon"><i class="fa fa-key"></i></span>').appendTo(topRow);
                $('<span class="entry-name">').text(entry.name).appendTo(topRow);
                var tools = $('<span class="button-row entry-tools">').appendTo(topRow);
                var expandedRow;
                topRow.click(function(e) {
                    if (expandedRow) {
                        expandedRow.slideUp(200,function() {
                            expandedRow.remove();
                            expandedRow = null;
                        })
                    } else {
                        expandedRow = expandKey(container,entry);
                    }
                    })
                if (!entry.system) {
                    $('<button class="editor-button editor-button-small"><i class="fa fa-trash"></i></button>')
                        .appendTo(tools)
                        .click(function(e) {
                            e.stopPropagation();
                            var spinner = utils.addSpinnerOverlay(row).addClass('projects-dialog-spinner-contain');
                            var notification = RED.notify("Are you sure you want to delete the SSH key '"+entry.name+"'? This cannot be undone.", {
                                type: 'warning',
                                modal: true,
                                fixed: true,
                                buttons: [
                                    {
                                        text: RED._("common.label.cancel"),
                                        click: function() {
                                            spinner.remove();
                                            notification.close();
                                        }
                                    },
                                    {
                                        text: "Delete key",
                                        click: function() {
                                            notification.close();
                                            var url = "settings/user/keys/"+entry.name;
                                            var options = {
                                                url: url,
                                                type: "DELETE",
                                                responses: {
                                                    200: function(data) {
                                                        row.fadeOut(200,function() {
                                                            keyList.editableList('removeItem',entry);
                                                            setTimeout(spinner.remove, 100);
                                                            if (keyList.editableList('length') === 0) {
                                                                keyList.editableList('addItem',emptyItem);
                                                            }
                                                        });
                                                    },
                                                    400: {
                                                        'unexpected_error': function(error) {
                                                            console.log(error);
                                                            spinner.remove();
                                                        }
                                                    },
                                                }
                                            }
                                            utils.sendRequest(options);
                                        }
                                    }
                                ]
                            });
                        });
                }
                if (entry.expand) {
                    expandedRow = expandKey(container,entry);
                }
            }
        });

        var refreshSSHKeyList = function(justAdded) {
            $.getJSON("settings/user/keys",function(result) {
                if (result.keys) {
                    result.keys.sort(function(A,B) {
                        return A.name.localeCompare(B.name);
                    });
                    keyList.editableList('empty');
                    result.keys.forEach(function(key) {
                        if (key.name === justAdded) {
                            key.expand = true;
                        }
                        keyList.editableList('addItem',key);
                    });
                    if (keyList.editableList('length') === 0) {
                        keyList.editableList('addItem',emptyItem);
                    }

                }
            })
        }
        refreshSSHKeyList();

    }

    function createSettingsPane(activeProject) {
        var pane = $('<div id="user-settings-tab-gitconfig" class="project-settings-tab-pane node-help"></div>');
        createGitUserSection(pane);
        createSSHKeySection(pane);
        return pane;
    }

    var utils;
    function init(_utils) {
        utils = _utils;
        RED.userSettings.add({
            id:'gitconfig',
            title: "Git config", // TODO: nls
            get: createSettingsPane,
            close: function() {
                var currentGitSettings = RED.settings.get('git') || {};
                currentGitSettings.user = currentGitSettings.user || {};
                currentGitSettings.user.name = gitUsernameInput.val();
                currentGitSettings.user.email = gitEmailInput.val();
                RED.settings.set('git', currentGitSettings);
            }
        });
    }

    return {
        init: init,
    };
})();
