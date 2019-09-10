import React, { useEffect, useState } from "react";
import { RouterProps, withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { loadState, State } from "./DatasetAddCommon";
import { User } from "reducers/userManagementReducer";

type Props = { initialState: State; user: User } & RouterProps;

function mapStateToProps(state: any) {
    return {
        user: state.userManagement && state.userManagement.user,
        isFetchingWhoAmI: state.userManagement.isFetchingWhoAmI
    };
}

export default <T extends Props>(Component: React.ComponentType<T>) => {
    const withAddDatasetState = (props: T) => {
        const [state, updateData] = useState<State | undefined>(undefined);

        useEffect(() => {
            // Once redux has finished getting a logged in user, load the state (we need to pass the current user in to populate default state)
            if (props.user && props.user.id !== "") {
                loadState(props.match.params.dataset, props.user).then(
                    state => {
                        updateData(state);
                    }
                );
            }
        }, [props.user]);

        if (
            !props.user ||
            props.user.id === "" ||
            props.user.isAdmin !== true
        ) {
            if (props.isFetchingWhoAmI) {
                return <div>Loading...</div>;
            } else {
                return (
                    <div
                        className="au-body au-page-alerts au-page-alerts--error"
                        style={{ marginTop: "50px" }}
                    >
                        <span>
                            Only admin users are allowed to access this page.
                        </span>
                    </div>
                );
            }
        }
        if (state && props.user.isAdmin === true) {
            return <Component {...props} initialState={state} />;
        } else {
            return <div>Loading...</div>;
        }
    };

    return connect(mapStateToProps)(withRouter(withAddDatasetState));
};
