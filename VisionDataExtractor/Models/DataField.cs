using System;

namespace VisionDataExtractor.Models
{
    public class DataField
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Prompt { get; set; }

        public DataField()
        {
            Id = Guid.NewGuid();
        }
    }
}
