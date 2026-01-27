export type XUser = {
  username: string;
  displayname: string;
};

export type XAuth = {
  gSearchKey: string;
  gSearchCx: string;
};

export type XRaw = {
  kind: string;
  url: unknown;
  queries: unknown;
  context: unknown;
  searchInformation: unknown;
  items: {
    pagemap: {
      person: {
        image: string;
        identifier: string;
        name: string;
        alternatename: string;
        disambiguatingdescription: string;
        url: string;
      }[];
      socialmediaposting: XRawItem[];
    };
  }[];
};

export type XRawItem = {
  identifier: string;
  commentcount: string;
  articlebody: string;
  datecreated: string;
  url: string;
  position: string;
  headline: string;
  datepublished: string;
  isbasedon: string;
};
