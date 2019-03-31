module.exports = {
    /**
     * Citation: https://stackoverflow.com/questions/31788681/angular2-validator-which-relies-on-multiple-form-fields
     */
    matchingPasswords: function matchingPasswords(passwordKey, confirmPasswordKey) {
        return function (group) {
            var password = group.controls[passwordKey];
            var confirmPassword = group.controls[confirmPasswordKey];

            if (password.value !== confirmPassword.value) {
                return {mismatchedPasswords: true};
            }
            return {};
        };
    }
};
