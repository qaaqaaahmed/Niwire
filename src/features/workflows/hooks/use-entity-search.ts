// interesting so the trick here is a component that has a local state which syncs with params.search
// and when user types... it check first if the input(localsearch) was cleared, if so then immediately clear the search in the url leading to a rerender,
// and also either way if the dependencies change send a timer off ... that after 500ms updates the params if localsearch is not equal to params.search?
//  that the whole trick? temporarily store the value in a local search before letting nuqs know after 500ms
//  to which nuqs notifies all the component subscribed to that state which calls the db
//  The cleanup is what makes it a debounce. Without clearTimeout, every keystroke’s timer would fire,
//  and you’d get an update for “r”, “ru”, and “run”. The cleanup cancels all but the last.
//  Also, page resets to 1. Every time the search changes, setParams sets the page back to the default,
//  because page 4 of the old results means nothing for the new ones.

import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

interface useEntitSearchProps<
  T extends { page: number; pageSize: number; search: string },
> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export const useEntitySearch = <
  T extends { page: number; pageSize: number; search: string },
>({
  params,
  setParams,
  debounceMs = 500,
}: useEntitSearchProps<T>) => {
  const [localSearch, setLocalSearch] = useState(params.search);

  // const prevParams = useRef<T | null>(null);

  useEffect(() => {
    // console.log("SAME PARAMS OBJECT: ", Object.is(prevParams.current, params));
    // prevParams.current = params;
    if (localSearch === "" && params.search !== "") {
      setParams({
        ...params,
        search: "",
        page: PAGINATION.DEFAULT_PAGE,
      });
    }

    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          ...params,
          page: PAGINATION.DEFAULT_PAGE,
          search: localSearch,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debounceMs, params, setParams, localSearch]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchValue: setLocalSearch,
  };
};
