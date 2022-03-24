

export type AutodeskProfile = {
    userId: string
    userName: string
    emailId: string
    firstName: string
    lastName: string
    profileImages: {
      sizeX20: string
      sizeX40: string
      sizeX50: string
      sizeX58: string
      sizeX80: string
      sizeX120: string
      sizeX160: string
      sizeX176: string
      sizeX240: string
      sizeX360: string
    }
    lastLoginDate: Date
}


export type AutodeskProject = {
  id: string
  name: string
  root_folder_id: string
}

export type AutodeskItem = {
    id: string
    name: string
}

export type AutodeskFolderContents = {files: Array<AutodeskItem>, folders:  Array<AutodeskItem>}

