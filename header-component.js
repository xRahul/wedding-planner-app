const Header = ({ weddingInfo }) => {
    return (
        <div className="header">
            <h1>💒 {weddingInfo.brideName} &amp; {weddingInfo.groomName}'s Wedding</h1>
            <p>{formatDate(weddingInfo.weddingDate)} • {weddingInfo.location}</p>
        </div>
    );
};