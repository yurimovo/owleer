export const lastModifiedTime = (time: string | number | Date) => {
  const createdDate = new Date(time);
  const year = createdDate.getFullYear();
  let month = createdDate.getMonth() + 1;
  let day = createdDate.getDate();
  let seconds = createdDate.getSeconds();
  let minute = createdDate.getMinutes();
  let hours = createdDate.getHours();

  return (
    hours + ":" + minute + ":" + seconds + " " + day + "-" + month + "-" + year
  );
};
