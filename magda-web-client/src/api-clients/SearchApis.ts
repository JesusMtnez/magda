import { config } from "config";

import buildSearchQueryString, {
    Query as SearchQuery,
    Query
} from "../helpers/buildSearchQueryString";
import { DataSearchJson } from "../helpers/datasetSearch";

type SearchApiResult = {
    hitCount: number;
    organisations: SearchApiPublisher[];
};
type SearchApiPublisher = {
    /** A UUID identifying the organisation in the registry */
    identifier: string;
    /** An acronym used for prefixing purposes - the same as 'id' in 'source' */
    id: string;
    name: string;
    acronym: string;
    aggKeywords: string[];
    datasetCount: number;
    description: string;
    email: string;
    imageUrl: string;
    jurisdiction: string;
    phone: string;
    website: string;
    source: {
        id: string;
        name: string;
    };
};

export function searchPublishers(
    query: string,
    start: number = 1,
    searchResultsPerPage: number = 10
): Promise<SearchApiResult> {
    const url = `${config.searchApiUrl +
        "organisations"}?query=${query}&start=${(start - 1) *
        searchResultsPerPage}&limit=${searchResultsPerPage}`;
    return fetch(url, config.fetchOptions).then(response => {
        if (!response.ok) {
            let statusText = response.statusText;
            // response.statusText are different in different browser, therefore we unify them here
            if (response.status === 404) {
                statusText = "Not Found";
            }
            throw Error(statusText);
        }
        return response.json();
    });
}

type AutocompletePublisher = {
    countErrorUpperBound: number;
    hitCount: number;
    identifier: string;
    matched: boolean;
    value: string;
};

type AutocompleteResponse = {
    /** The count of all hits that match the *general* query */
    hitCount: number;
    options: AutocompletePublisher[];
};

export function autocompletePublishers(
    generalQuery: SearchQuery,
    term: string
): Promise<AutocompleteResponse> {
    const generalQueryString = buildSearchQueryString({
        ...generalQuery,
        start: 0,
        limit: 10,
        q: "*",
        publisher: undefined
    });

    return fetch(
        config.searchApiUrl +
            `facets/publisher/options?generalQuery=${encodeURIComponent(
                generalQuery.q || "*"
            )}&${generalQueryString}&facetQuery=${term}`,
        config.fetchOptions
    ).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        } else {
            return response.json();
        }
    });
}

type AutoCompleteResult = {
    inputString: String;
    suggestions: string[];
    errorMessage?: string;
};

export async function autoCompleteAccessLocation(
    term: string,
    size: number = 8
): Promise<string[]> {
    const url = `${config.searchApiUrl +
        "autoComplete"}?field=accessNotes.location&input=${encodeURIComponent(
        term
    )}&size=${size}`;

    const response = await fetch(url, config.fetchOptions);
    try {
        const resData: AutoCompleteResult = await response.json();
        if (resData.errorMessage) {
            throw new Error(resData.errorMessage);
        }
        return resData.suggestions;
    } catch (e) {
        if (!response.ok) {
            // --- server side error
            throw Error(response.statusText);
        } else {
            throw Error(e);
        }
    }
}

export function searchDatasets(queryObject: Query): Promise<DataSearchJson> {
    let url: string =
        config.searchApiUrl + `datasets?${buildSearchQueryString(queryObject)}`;
    return fetch(url, config.fetchOptions).then((response: any) => {
        if (response.status === 200) {
            return response.json();
        }
        let errorMessage = response.statusText;
        if (!errorMessage)
            errorMessage = "Failed to retrieve network resource.";
        throw new Error(errorMessage);
    });
}
